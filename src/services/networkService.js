/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import { orderBy, flatten, uniq, get, pickBy, keyBy } from 'lodash';
import BN from 'bn.js';
import axios from 'axios';
import JSONBigNumber from 'omg-json-bigint';
import { bufferToHex } from 'ethereumjs-util';
import erc20abi from 'human-standard-token-abi';

import Web3 from 'web3';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WalletLink from 'walletlink';

import store from 'store';
import { getToken } from 'actions/tokenAction';
import config from 'util/config';

class NetworkService {
  constructor () {
    this.web3 = null;
    this.provider = null;
    this.rootChain = null;
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl, plasmaContractAddress: config.plasmaAddress });
    this.OmgUtil = OmgUtil;
    this.plasmaContractAddress = config.plasmaAddress;
  }

  makeWeb3 (provider) {
    return new Web3(
      provider,
      null,
      { transactionConfirmationBlocks: 1 }
    );
  }

  getChainId () {
    switch (config.network) {
      case 'main':
        return 1;
      case 'ropsten':
        return 3;
      case 'rinkeby':
        return 4;
      default:
        return 1;
    }
  }

  async enableWalletLink () {
    try {
      const walletLink = new WalletLink({
        appName: 'OMG Network | Web Wallet',
        appLogoUrl: '/favicon.png',
        darkMode: false
      });
      this.provider = walletLink.makeWeb3Provider(
        config.rpcProxy,
        this.getChainId()
      );
      await this.provider.enable();
      this.web3 = this.makeWeb3(this.provider);
      this.bindProviderListeners('walletlink');
      return true;
    } catch (error) {
      return false;
    }
  }

  async enableWalletConnect () {
    try {
      this.provider = new WalletConnectProvider({
        rpc: { [this.getChainId()]: config.rpcProxy },
        pollingInterval: 30000
      });
      await this.provider.enable();
      this.web3 = this.makeWeb3(this.provider);
      this.bindProviderListeners('walletconnect');
      return true;
    } catch (error) {
      return false;
    }
  }

  async enableBrowserWallet () {
    try {
      if (window.ethereum) {
        this.provider = window.ethereum;
        window.ethereum.autoRefreshOnNetworkChange = false;
        await window.ethereum.enable();
      } else if (window.web3) {
        this.provider = window.web3.currentProvider;
      } else {
        return false;
      }
      this.web3 = this.makeWeb3(this.provider);
      this.bindProviderListeners('browserwallet');
      return true;
    } catch (error) {
      return false;
    }
  }

  handleAccountsChanged (accounts) {
    const providerRegisteredAccount = accounts ? accounts[0] : null;
    const appRegisteredAcount = networkService.account;
    if (!providerRegisteredAccount || !appRegisteredAcount) {
      return;
    }
    if (appRegisteredAcount.toLowerCase() !== providerRegisteredAccount.toLowerCase()) {
      window.location.reload(false);
    }
  }

  bindProviderListeners (walletProvider) {
    if (walletProvider === 'browserwallet' && window.ethereum) {
      try {
        window.ethereum.on('accountsChanged', (accounts) => {
          this.handleAccountsChanged(accounts);
        });
        window.ethereum.on('networkChanged', function () {
          window.location.reload(false);
        });
      } catch (err) {
        console.warn('Web3 event handling not available');
      }
    }

    if (walletProvider === 'walletconnect') {
      try {
        this.provider.on('accountsChanged', (accounts) => {
          this.handleAccountsChanged(accounts);
        });
        this.provider.on('stop', function () {
          window.location.reload(false);
        });
      } catch (err) {
        console.warn('WalletConnect event handling not available');
      }
    }

    if (walletProvider === 'walletlink') {
      try {
        // add any walletlink listeners
      } catch (err) {
        console.warn('WalletLink event handling not available');
      }
    }
  }

  async initializeAccounts () {
    try {
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: this.plasmaContractAddress });
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      const network = await this.web3.eth.net.getNetworkType();
      const isCorrectNetwork = network === config.network;
      return isCorrectNetwork ? 'enabled' : 'wrongnetwork';
    } catch (error) {
      return false;
    }
  }

  async checkStatus () {
    const { byzantine_events, last_seen_eth_block_timestamp, last_seen_eth_block_number, services_synced_heights } = await this.childChain.status();

    const filteredByzantineEvents = byzantine_events
      .filter(i => {
        if (
          i.event === 'unchallenged_exit' ||
          i.event === 'invalid_block' ||
          i.event === 'block_withholding'
        ) {
          return true;
        }
        return false;
      });

    const blockGetterHeight = services_synced_heights.find(i => i.service === 'block_getter' ).height;
    const watcherSynced = last_seen_eth_block_number - blockGetterHeight <= config.checkSyncInterval;

    return {
      connection: !!byzantine_events,
      byzantine: !!filteredByzantineEvents.length,
      watcherSynced: watcherSynced,
      lastSeenBlock: last_seen_eth_block_timestamp
    };
  }

  async getAllTransactions () {
    const rawTransactions = await this.childChain.getTransactions({ address: this.account });
    const currencies = uniq(flatten(rawTransactions.map(i => i.inputs.map(input => input.currency))));
    await Promise.all(currencies.map(i => getToken(i)));

    const transactions = rawTransactions.map(i => {
      return {
        ...i,
        metadata: OmgUtil.transaction.decodeMetadata(i.metadata)
      };
    });
    return transactions;
  }

  async getBalances () {
    const _childchainBalances = await this.childChain.getBalance(this.account);
    const childchainBalances = await Promise.all(_childchainBalances.map(
      async i => {
        const token = await getToken(i.currency);
        return {
          ...token,
          amount: i.amount.toString()
        };
      }
    ));

    const rootErc20Balances = await Promise.all(childchainBalances.map(
      async i => {
        if (i.name !== 'ETH') {
          const balance = await OmgUtil.getErc20Balance({
            web3: this.web3,
            address: this.account,
            erc20Address: i.currency
          });
          return {
            ...i,
            amount: balance.toString()
          };
        }
      }
    ));

    const _rootEthBalance = await this.web3.eth.getBalance(this.account);
    const ethToken = await getToken(OmgUtil.transaction.ETH_CURRENCY);
    const rootchainEthBalance = {
      ...ethToken,
      amount: _rootEthBalance
    };

    return {
      rootchain: orderBy([ rootchainEthBalance, ...rootErc20Balances.filter(i => !!i) ], i => i.currency),
      childchain: orderBy(childchainBalances, i => i.currency)
    };
  }

  async checkAllowance (currency) {
    try {
      const tokenContract = new this.web3.eth.Contract(erc20abi, currency);
      const { address: erc20VaultAddress } = await this.rootChain.getErc20Vault();
      const allowance = await tokenContract.methods.allowance(this.account, erc20VaultAddress).call();
      return allowance.toString();
    } catch (error) {
      throw new Error('Error checking deposit allowance for ERC20');
    }
  }

  async approveErc20 (value, currency, gasPrice) {
    const valueBN = new BN(value.toString());
    return this.rootChain.approveToken({
      erc20Address: currency,
      amount: valueBN,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
  }

  async resetApprove (value, currency, gasPrice) {
    const valueBN = new BN(value.toString());
    // the reset approval
    await this.rootChain.approveToken({
      erc20Address: currency,
      amount: 0,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
    // approval for new amount
    return this.rootChain.approveToken({
      erc20Address: currency,
      amount: valueBN,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
  }

  // normalize signing methods across wallet providers
  async signTypedData (typedData) {
    function isExpectedSignTypedV3Error (message) {
      if (
        message.includes('The method eth_signTypedData_v3 does not exist')
        || message.includes('Invalid JSON RPC response')
        || message.includes('Cannot read property') // walletlink
        || message.includes('undefined is not an object') // walletlink safari
      ) {
        return true;
      }
      return false;
    }

    try {
      const signature = await this.web3.currentProvider.send(
        'eth_signTypedData_v3',
        [
          this.web3.utils.toChecksumAddress(this.account),
          JSONBigNumber.stringify(typedData)
        ]
      );
      return signature;
    } catch (error) {
      if (!isExpectedSignTypedV3Error(error.message)) {
        // not an expected error
        console.log('unexpected signing error: ', error.message);
        throw error;
      }
      // method doesnt exist try another
    }

    // fallback signing method if signTypedData is not implemented by the provider
    const typedDataHash = OmgUtil.transaction.getToSignHash(typedData);
    const signature = await this.web3.eth.sign(
      bufferToHex(typedDataHash),
      this.web3.utils.toChecksumAddress(this.account)
    );
    return signature;
  }

  async mergeUtxos (utxos) {
    const _metadata = 'Merge UTXOs';
    const payments = [ {
      owner: this.account,
      currency: utxos[0].currency,
      amount: utxos.reduce((prev, curr) => {
        return prev.add(new BN(curr.amount));
      }, new BN(0))
    } ];
    const fee = {
      currency: OmgUtil.transaction.ETH_CURRENCY,
      amount: 0
    };
    const txBody = OmgUtil.transaction.createTransactionBody({
      fromAddress: this.account,
      fromUtxos: utxos,
      payments,
      fee,
      metadata: OmgUtil.transaction.encodeMetadata(_metadata)
    });
    const typedData = OmgUtil.transaction.getTypedData(txBody, this.plasmaContractAddress);
    const signature = await this.signTypedData(typedData);
    const signatures = new Array(txBody.inputs.length).fill(signature);
    const signedTxn = this.childChain.buildSignedTransaction(typedData, signatures);
    const submittedTransaction = await this.childChain.submitTransaction(signedTxn);
    return {
      ...submittedTransaction,
      block: {
        blknum: submittedTransaction.blknum,
        timestamp: Math.round((new Date()).getTime() / 1000)
      },
      metadata: _metadata,
      status: 'Pending'
    };
  }

  async fetchFees () {
    const allFees = await this.childChain.getFees();
    return allFees['1'];
  }

  async transfer ({
    recipient,
    value,
    currency,
    feeToken,
    metadata
  }) {
    const _utxos = await this.childChain.getUtxos(this.account);
    const utxos = orderBy(_utxos, i => i.amount, 'desc');

    const allFees = await this.fetchFees();
    const feeInfo = allFees.find(i => i.currency === feeToken);
    if (!feeInfo) throw new Error(`${feeToken} is not a supported fee token.`);

    const isAddress = this.web3.utils.isAddress(recipient);
    if (!isAddress) {
      recipient = await this.web3.eth.ens.getAddress(recipient);
    }

    if (!recipient) {
      throw Error('Not a valid ENS name');
    }

    const payments = [ {
      owner: recipient,
      currency,
      amount: new BN(value)
    } ];
    const fee = {
      currency: feeToken,
      amount: new BN(feeInfo.amount)
    };
    const txBody = OmgUtil.transaction.createTransactionBody({
      fromAddress: this.account,
      fromUtxos: utxos,
      payments,
      fee,
      metadata: metadata || OmgUtil.transaction.NULL_METADATA
    });
    const typedData = OmgUtil.transaction.getTypedData(txBody, this.plasmaContractAddress);
    const signature = await this.signTypedData(typedData);
    const signatures = new Array(txBody.inputs.length).fill(signature);
    const signedTxn = this.childChain.buildSignedTransaction(typedData, signatures);
    const submittedTransaction = await this.childChain.submitTransaction(signedTxn);
    return {
      ...submittedTransaction,
      block: {
        blknum: submittedTransaction.blknum,
        timestamp: Math.round((new Date()).getTime() / 1000)
      },
      metadata,
      status: 'Pending'
    };
  }

  async getUtxos () {
    const _utxos = await this.childChain.getUtxos(this.account);
    const utxos = await Promise.all(_utxos.map(async utxo => {
      const tokenInfo = await getToken(utxo.currency);
      return { ...utxo, tokenInfo };
    }));
    return utxos;
  }

  async getEthStats () {
    try {
      const currentETHBlockNumber = await this.web3.eth.getBlockNumber();
      return {
        currentETHBlockNumber
      };
    } catch (error) {
      return null;
    }
  }

  // run on boot to get past deposits
  async getDeposits () {
    const { contract: ethVault } = await this.rootChain.getEthVault();
    const { contract: erc20Vault } = await this.rootChain.getErc20Vault();

    let _ethDeposits = [];
    try {
      _ethDeposits = await ethVault.getPastEvents('DepositCreated', {
        filter: { depositor: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ETH DepositCreated events timed out: ', error.message);
    }

    let _erc20Deposits = [];
    try {
      _erc20Deposits = await erc20Vault.getPastEvents('DepositCreated', {
        filter: { depositor: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ERC20 DepositCreated events timed out: ', error.message);
    }

    const ethDeposits = await Promise.all(_ethDeposits.map(i => this.getDepositStatus(i)));
    const erc20Deposits = await Promise.all(_erc20Deposits.map(i => this.getDepositStatus(i)));
    return { eth: ethDeposits, erc20: erc20Deposits };
  }

  async getDepositStatus (deposit) {
    const depositFinality = 10;
    const state = store.getState();
    const ethBlockNumber = get(state, 'status.currentETHBlockNumber');
    const tokenInfo = await getToken(deposit.returnValues.token);
    const status = ethBlockNumber - deposit.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
    const pendingPercentage = (ethBlockNumber - deposit.blockNumber) / depositFinality;
    return { ...deposit, status, pendingPercentage: (pendingPercentage * 100).toFixed(), tokenInfo };
  }

  async depositEth (value, gasPrice) {
    const valueBN = new BN(value.toString());
    const result = await this.rootChain.deposit({
      amount: valueBN,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
    // normalize against deposits from pastevents
    const deposit = {
      ...result,
      isEth: true,
      returnValues: {
        token: OmgUtil.transaction.ETH_CURRENCY,
        amount: value.toString()
      }
    };
    return await this.getDepositStatus(deposit);
  }

  async depositErc20 (value, currency, gasPrice) {
    const valueBN = new BN(value.toString());
    const result = await this.rootChain.deposit({
      amount: valueBN,
      currency,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
    // normalize against deposits from pastevents
    const deposit = {
      ...result,
      returnValues: {
        token: currency,
        amount: value.toString()
      }
    };
    return await this.getDepositStatus(deposit);
  }


  // run on poll to check status of any 'pending' deposits
  async checkPendingDepositStatus () {
    const state = store.getState();
    const { eth: ethDeposits, erc20: erc20Deposits } = state.deposit;

    const pendingEthDeposits = pickBy(ethDeposits, (deposit, transactionHash) => {
      return deposit.status === 'Pending';
    });
    const pendingErc20Deposits = pickBy(erc20Deposits, (deposit, transactionHash) => {
      return deposit.status === 'Pending';
    });

    const updatedEthDeposits = await Promise.all(Object.values(pendingEthDeposits).map(this.getDepositStatus));
    const updatedErc20Deposits = await Promise.all(Object.values(pendingErc20Deposits).map(this.getDepositStatus));
    return { eth: updatedEthDeposits, erc20: updatedErc20Deposits };
  }

  // run on poll to check status of any 'pending' exits
  async checkPendingExitStatus () {
    const state = store.getState();
    const pendingExits = Object.values(state.exit.pending);
    const updatedExits = pendingExits.map(this.getExitStatus);
    return updatedExits;
  }

  getExitStatus (exit) {
    const exitFinality = 12;
    const state = store.getState();
    const ethBlockNumber = get(state, 'status.currentETHBlockNumber');
    const status = (ethBlockNumber - exit.blockNumber) >= exitFinality ? 'Confirmed' : 'Pending';
    const pendingPercentage = (ethBlockNumber - exit.blockNumber) / exitFinality;

    let enhancedExit = {
      ...exit,
      status,
      pendingPercentage: (pendingPercentage * 100).toFixed()
    };

    if (exit.returnValues) {
      const rawQueues = get(state, 'queue', {});
      const queues = flatten(Object.values(rawQueues));

      const exitId = networkService.web3.utils.hexToNumberString(exit.returnValues.exitId._hex);
      const queuedExit = queues.find(i => i.exitId === exitId);
      let queuePosition;
      let queueLength;
      if (queuedExit) {
        const tokenQueue = rawQueues[queuedExit.currency];
        queuePosition = tokenQueue.findIndex(x => x.exitId === exitId);
        queueLength = tokenQueue.length;
        enhancedExit = {
          ...enhancedExit,
          exitableAt: queuedExit.exitableAt,
          currency: queuedExit.currency,
          queuePosition: queuePosition + 1,
          queueLength
        };
      }
    }

    return enhancedExit;
  }

  async getExits () {
    const { contract } = await this.rootChain.getPaymentExitGame();

    let allExits = [];
    try {
      allExits = await contract.getPastEvents('ExitStarted', {
        filter: { owner: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ExitStarted events timed out: ', error.message);
      return null;
    }

    const exitedExits = [];
    for (const exit of allExits) {
      let isFinalized = [];
      try {
        isFinalized = await contract.getPastEvents('ExitFinalized', {
          filter: { exitId: exit.returnValues.exitId.toString() },
          fromBlock: 0
        });
      } catch (error) {
        console.log('Getting past ExitFinalized events timed out: ', error.message);
        return null;
      }
      if (isFinalized.length) {
        exitedExits.push(exit);
      }
    }

    const pendingExits = allExits
      .filter(i => {
        const foundMatch = exitedExits.find(x => x.blockNumber === i.blockNumber);
        return !foundMatch;
      })
      .map(this.getExitStatus);

    return {
      pending: { ...keyBy(pendingExits, 'transactionHash') },
      exited: { ...keyBy(exitedExits, 'transactionHash') }
    };
  }

  async checkForExitQueue (token) {
    return this.rootChain.hasToken(token);
  }

  async getExitQueue (_currency) {
    const currency = _currency.toLowerCase();
    let queue = [];
    try {
      queue = await this.rootChain.getExitQueue(currency);
    } catch (error) {
      console.log('Getting the exitQueue timed out: ', error.message);
      return null;
    }

    return {
      currency,
      queue: queue.map(i => ({
        ...i,
        currency
      }))
    };
  }

  async addExitQueue (token, gasPrice) {
    return this.rootChain.addToken({
      token,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
  }

  async exitUtxo (utxo, gasPrice) {
    const exitData = await this.childChain.getExitData(utxo);
    try {
      const res = await this.rootChain.startStandardExit({
        utxoPos: exitData.utxo_pos,
        outputTx: exitData.txbytes,
        inclusionProof: exitData.proof,
        txOptions: {
          from: this.account,
          gasPrice: gasPrice.toString()
        }
      });
      return {
        ...res,
        status: 'Pending',
        pendingPercentage: 0
      };
    } catch (error) {
      // if error from user cancellation dont retry
      if (error.code !== 4001) {
        // sometimes gas estimation can fail
        // so try again but set the gas explicitly to avoid the estimiate
        return this.rootChain.startStandardExit({
          utxoPos: exitData.utxo_pos,
          outputTx: exitData.txbytes,
          inclusionProof: exitData.proof,
          txOptions: {
            from: this.account,
            gasPrice: gasPrice.toString(),
            gas: 400000
          }
        });
      }

      throw error;
    }
  }

  async processExits (maxExits, currency, gasPrice) {
    return this.rootChain.processExits({
      token: currency,
      exitId: 0,
      maxExitsToProcess: maxExits,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
  }

  async getGasPrice () {
    // first try ethgasstation
    try {
      const { data: { safeLow, average, fast } } = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
      return {
        slow: safeLow * 100000000,
        normal: average * 100000000,
        fast: fast * 100000000
      };
    } catch (error) {
      //
    }

    // if not web3 oracle
    try {
      const _medianEstimate = await this.web3.eth.getGasPrice();
      const medianEstimate = Number(_medianEstimate);
      return {
        slow: Math.max(medianEstimate / 2, 1000000000),
        normal: medianEstimate,
        fast: medianEstimate * 5
      };
    } catch (error) {
      //
    }

    // if not these defaults
    return {
      slow: 1000000000,
      normal: 2000000000,
      fast: 10000000000
    };
  }
}

const networkService = new NetworkService();
export default networkService;
