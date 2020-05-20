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

import Web3 from 'web3';
import { orderBy, flatten, uniq } from 'lodash';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import BN from 'bn.js';
import axios from 'axios';
import JSONBigNumber from 'omg-json-bigint';
import config from 'util/config';

import { getToken } from 'actions/tokenAction';

class NetworkService {
  constructor () {
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl });
    this.OmgUtil = OmgUtil;
    this.plasmaContractAddress = config.plasmaAddress;
  }

  async enableNetwork () {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: this.plasmaContractAddress });
      try {
        await window.ethereum.enable();
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        const network = await this.web3.eth.net.getNetworkType();
        return network === config.network
      } catch {
        return false;
      }
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: this.plasmaContractAddress });
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      const network = await this.web3.eth.net.getNetworkType();
      return network === config.network
    } else {
      return false;
    }
  }

  async checkStatus () {
    const { byzantine_events, last_seen_eth_block_timestamp } = await this.childChain.status();
    const currentUnix = Math.round((new Date()).getTime() / 1000);

    // filter out piggyback_available event from byzantine_events array, since its not a byzantine event!
    const filteredByzantineEvents = byzantine_events.filter(i =>  i.event !== 'piggyback_available');

    return {
      connection: !!byzantine_events,
      byzantine: !!filteredByzantineEvents.length,
      secondsSinceLastSync: currentUnix - last_seen_eth_block_timestamp,
      lastSeenBlock: last_seen_eth_block_timestamp
    }
  }

  async getAllTransactions () {
    const rawTransactions = await this.childChain.getTransactions({ address: this.account });
    const currencies = uniq(flatten(rawTransactions.map(i => i.inputs.map(input => input.currency))));
    await Promise.all(currencies.map(i => getToken(i)));

    const transactions = rawTransactions.map(i => {
      return {
        ...i,
        metadata: OmgUtil.transaction.decodeMetadata(i.metadata)
      }
    })
    return transactions;
  }

  async getBalances () {
    const _childchainBalances = await this.childChain.getBalance(this.account);
    const childchainBalances = await Promise.all(_childchainBalances.map(
      async i => {
        const token = await getToken(i.currency)
        return {
          ...token,
          amount: i.amount.toString()
        }
      }
    ))

    const rootErc20Balances = await Promise.all(childchainBalances.map(
      async i => {
        if (i.name !== 'ETH') {
          const balance = await OmgUtil.getErc20Balance({
            web3: this.web3,
            address: this.account,
            erc20Address: i.currency
          })
          return {
            ...i,
            amount: balance.toString()
          }
        }
      }
    ))

    const _rootEthBalance = await this.web3.eth.getBalance(this.account);
    const ethToken = await getToken(OmgUtil.transaction.ETH_CURRENCY)
    const rootchainEthBalance = {
      ...ethToken,
      amount: _rootEthBalance
    }

    return {
      rootchain: orderBy([rootchainEthBalance, ...rootErc20Balances.filter(i => !!i)], i => i.currency),
      childchain: orderBy(childchainBalances, i => i.currency)
    }
  }

  async deposit (value, currency, gasPrice) {
    if (currency !== OmgUtil.transaction.ETH_CURRENCY) {
      try {
        await this.rootChain.approveToken({
          erc20Address: currency,
          amount: value,
          txOptions: {
            from: this.account,
            gasPrice: gasPrice.toString()
          }
        });
      } catch (error) {
        throw new Error(`Approval to deposit ${value} ${currency} failed.`);
      }
    }
    return this.rootChain.deposit({
      amount: new BN(value),
      ...currency !== OmgUtil.transaction.ETH_CURRENCY ? { currency } : {},
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    })
  }

  // normalize signing methods across wallet providers
  async signTypedData (typedData) {
    if (!!window.imToken) {
      // TODO: this doenst actually work
      const signature = await this.web3.eth.sign(typedData, this.web3.utils.toChecksumAddress(this.account));
      return signature;
    }

    const signature = await this.web3.currentProvider.send(
      'eth_signTypedData_v3',
      [
        this.web3.utils.toChecksumAddress(this.account),
        JSONBigNumber.stringify(typedData)
      ]
    );
    return signature;
  }

  async mergeUtxos (utxos) {
    const _metadata = 'Merge UTXOs'
    const payments = [{
      owner: this.account,
      currency: utxos[0].currency,
      amount: utxos.reduce((prev, curr) => {
        return prev.add(new BN(curr.amount))
      }, new BN(0))
    }];
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

    const payments = [{
      owner: recipient,
      currency,
      amount: new BN(value)
    }];
    const fee = {
      currency: feeToken,
      amount: new BN(feeInfo.amount)
    };
    const txBody = OmgUtil.transaction.createTransactionBody({
      fromAddress: this.account,
      fromUtxos: utxos,
      payments,
      fee,
      metadata
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
      return { ...utxo, tokenInfo }
    }));
    return utxos;
  }

  async getDeposits () {
    const depositFinality = 10;
    const { contract: ethVault } = await this.rootChain.getEthVault();
    const { contract: erc20Vault } = await this.rootChain.getErc20Vault();
    const ethBlockNumber = await this.web3.eth.getBlockNumber();

    let _ethDeposits = [];
    try {
      _ethDeposits = await ethVault.getPastEvents('DepositCreated', {
        filter: { depositor: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ETH DepositCreated events timed out. Trying again...');
    }

    const ethDeposits = await Promise.all(_ethDeposits.map(async i => {
      const tokenInfo = await getToken(i.returnValues.token);
      const status = ethBlockNumber - i.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
      const pendingPercentage = (ethBlockNumber - i.blockNumber) / depositFinality;
      return { ...i, status, pendingPercentage: (pendingPercentage * 100).toFixed(), tokenInfo }
    }));

    let _erc20Deposits = [];
    try {
      _erc20Deposits = await erc20Vault.getPastEvents('DepositCreated', {
        filter: { depositor: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ERC20 DepositCreated events timed out. Trying again...');
    }

    const erc20Deposits = await Promise.all(_erc20Deposits.map(async i => {
      const tokenInfo = await getToken(i.returnValues.token);
      const status = ethBlockNumber - i.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
      const pendingPercentage = (ethBlockNumber - i.blockNumber) / depositFinality;
      return { ...i, status, pendingPercentage: (pendingPercentage * 100).toFixed(), tokenInfo }
    }));

    return { eth: ethDeposits, erc20: erc20Deposits };
  }

  async getExits () {
    const finality = 12;
    const ethBlockNumber = await this.web3.eth.getBlockNumber();
    const { contract } = await this.rootChain.getPaymentExitGame();

    let allExits = [];
    try {
      allExits = await contract.getPastEvents('ExitStarted', {
        filter: { owner: this.account },
        fromBlock: 0
      });
    } catch (error) {
      console.log('Getting past ExitStarted events timed out. Trying again...');
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
        console.log('Getting past ExitFinalized events timed out. Trying again...');
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
      .map(i => {
        const status = ethBlockNumber - i.blockNumber >= finality ? 'Confirmed' : 'Pending';
        const pendingPercentage = (ethBlockNumber - i.blockNumber) / finality;
        return {
          ...i,
          status,
          pendingPercentage: (pendingPercentage * 100).toFixed()
        };
      });

    return {
      pending: pendingExits,
      exited: exitedExits
    }
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
      console.log('Getting the exitQueue timed out. Trying again...');
    }

    return {
      currency,
      queue: queue.map(i => ({
        ...i,
        currency
      }))
    }
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
    return this.rootChain.startStandardExit({
      utxoPos: exitData.utxo_pos,
      outputTx: exitData.txbytes,
      inclusionProof: exitData.proof,
      txOptions: {
        from: this.account,
        gasPrice: gasPrice.toString()
      }
    });
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
    })
  }

  async getGasPrice () {
    // first try ethgasstation
    try {
      const { data: { safeLow, average, fast } } = await axios.get('https://ethgasstation.info/json/ethgasAPI.json');
      return {
        slow: safeLow * 100000000,
        normal: average * 100000000,
        fast: fast * 100000000
      }
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
      }
    } catch (error) {
      //
    }

    // if not these defaults
    return {
      slow: 1000000000,
      normal: 2000000000,
      fast: 10000000000
    }
  }
}

const networkService = new NetworkService();
export default networkService;
