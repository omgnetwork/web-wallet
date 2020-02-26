import Web3 from 'web3';
import { orderBy, flatten, uniq } from 'lodash';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import BN from 'bn.js';
import JSONBigNumber from 'json-bigint';
import config from 'util/config';

import { getToken } from 'actions/tokenAction';

class NetworkService {
  constructor () {
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl });
    this.OmgUtil = OmgUtil;
    this.plasmaContractAddress = '';
  }

  async enableNetwork () {
    try {
      const { contract_addr } = await this.childChain.status();
      this.plasmaContractAddress = contract_addr.plasma_framework;
    } catch (err) {
      return false;
    }

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

  async getExitQueue (currency) {
    const queue = await this.rootChain.getExitQueue(currency);
    return {
      currency,
      queue: queue.map(i => ({
        ...i,
        currency
      }))
    }
  }

  async deposit (value, currency) {
    if (currency !== OmgUtil.transaction.ETH_CURRENCY) {
      await this.rootChain.approveToken({
        erc20Address: currency,
        amount: value,
        txOptions: { from: this.account, gas: 6000000 }
      })
    }
    return this.rootChain.deposit({
      amount: new BN(value),
      ...currency !== OmgUtil.transaction.ETH_CURRENCY ? { currency } : {},
      txOptions: { from: this.account, gas: 6000000 }
    })
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
    const signature = await this.web3.currentProvider.send(
      'eth_signTypedData_v3',
      [
        this.web3.utils.toChecksumAddress(this.account),
        JSONBigNumber.stringify(typedData)
      ]
    );
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
    const signature = await this.web3.currentProvider.send(
      'eth_signTypedData_v3',
      [
        this.web3.utils.toChecksumAddress(this.account),
        JSONBigNumber.stringify(typedData)
      ]
    );
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

    const _ethDeposits = await ethVault.getPastEvents('DepositCreated', {
      filter: { depositor: this.account },
      fromBlock: 0
    });
    const ethDeposits = await Promise.all(_ethDeposits.map(async i => {
      const tokenInfo = await getToken(i.returnValues.token);
      const status = ethBlockNumber - i.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
      const pendingPercentage = (ethBlockNumber - i.blockNumber) / depositFinality;
      return { ...i, status, pendingPercentage: (pendingPercentage * 100).toFixed(), tokenInfo }
    }));

    const _erc20Deposits = await erc20Vault.getPastEvents('DepositCreated', {
      filter: { depositor: this.account },
      fromBlock: 0
    });
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
    let allExits = await contract.getPastEvents('ExitStarted', {
      filter: { owner: this.account },
      fromBlock: 0
    });

    const exitedExits = [];
    for (const exit of allExits) {
      const isFinalized = await contract.getPastEvents('ExitFinalized', {
        filter: { exitId: exit.returnValues.exitId.toString() },
        fromBlock: 0
      });
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

  async exitUtxo (utxo) {
    const exitData = await this.childChain.getExitData(utxo);
    const hasToken = await this.rootChain.hasToken(utxo.currency);
    if (!hasToken) {
      await this.rootChain.addToken({
        token: utxo.currency,
        txOptions: { from: this.account, gas: 6000000 }
      });
    }
    return this.rootChain.startStandardExit({
      utxoPos: exitData.utxo_pos,
      outputTx: exitData.txbytes,
      inclusionProof: exitData.proof,
      txOptions: { from: this.account, gas: 6000000 }
    });
  }

  async processExits (maxExits, currency) {
    return this.rootChain.processExits({
      token: currency,
      exitId: 0,
      maxExitsToProcess: maxExits,
      txOptions: { from: this.account, gas: 6000000 }
    })
  }
}

const networkService = new NetworkService();
export default networkService;
