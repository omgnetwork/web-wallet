import Web3 from 'web3';
import { orderBy } from 'lodash';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import erc20abi from 'human-standard-token-abi';
import truncate from 'truncate-middle';
import BN from 'bn.js';
import JSONBigNumber from 'json-bigint';
import config from 'util/config';

class NetworkService {
  constructor () {
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl });
    this.OmgUtil = OmgUtil;
  }

  async enableNetwork () {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: config.plasmaFrameworkAddress });
      try {
        await window.ethereum.enable();
        const accounts = await this.web3.eth.getAccounts();
        this.account = accounts[0];
        return true;
      } catch {
        return false;
      }
    } else if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: config.plasmaFrameworkAddress });
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      return true;
    } else {
      return false;
    }
  }

  async checkStatus () {
    return this.childChain.status();
  }

  async getAllTransactions () {
    const rawTransactions = await this.childChain.getTransactions({ address: this.account });
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
        const isEth = i.currency === OmgUtil.transaction.ETH_CURRENCY
        let symbol = 'WEI';
        if (!isEth) {
          const tokenContract = new this.web3.eth.Contract(erc20abi, i.currency);
          try {
            const _symbol = await tokenContract.methods.symbol().call();
            symbol = _symbol || truncate(i.currency, 6, 4, '...');
          } catch (err) {
            symbol = truncate(i.currency, 6, 4, '...');
          }
        }
        return {
          symbol,
          token: i.currency,
          amount: i.amount.toString()
        }
      }
    ))

    const rootErc20Balances = await Promise.all(childchainBalances.map(
      async i => {
        const isEth = i.symbol === 'WEI';
        if (!isEth) {
          const balance = await OmgUtil.getErc20Balance({
            web3: this.web3,
            address: this.account,
            erc20Address: i.token
          })
          return {
            symbol: i.symbol,
            token: i.token,
            amount: balance.toString()
          }
        }
      }
    ))

    const _rootEthBalance = await this.web3.eth.getBalance(this.account);
    const rootchainEthBalance = {
      symbol: 'WEI',
      token: OmgUtil.transaction.ETH_CURRENCY,
      amount: _rootEthBalance
    }

    return {
      rootchain: orderBy([rootchainEthBalance, ...rootErc20Balances.filter(i => !!i)], i => i.token),
      childchain: orderBy(childchainBalances, i => i.token)
    }
  }

  async getExitQueue (currency) {
    const _queue = await this.rootChain.getExitQueue(currency);
    const queue = _queue.length;
    return { currency, queue }
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

  async transfer ({
    recipient,
    value,
    currency,
    feeValue,
    feeToken,
    metadata
  }) {
    const payments = [{
      owner: recipient,
      currency,
      amount: new BN(value)
    }]
    const fee = {
      currency: feeToken,
      amount: new BN(feeValue)
    }
    const createdTx = await this.childChain.createTransaction({
      owner: this.account,
      payments,
      fee,
      metadata
    })

    // if erc20 only inputs, add empty eth input to cover the fee
    if (!createdTx.transactions[0].inputs.find(i => i.currency === OmgUtil.transaction.ETH_CURRENCY)) {
      const utxos = await this.childChain.getUtxos(this.account)
      const sorted = utxos
        .filter(utxo => utxo.currency === OmgUtil.transaction.ETH_CURRENCY)
        .sort((a, b) => new BN(b.amount).sub(new BN(a.amount)))
      // return early if no utxos
      if (!sorted || !sorted.length) {
        throw new Error(`No ETH utxo available to cover the fee amount`)
      }
      const ethUtxo = sorted[0]
      const emptyOutput = {
        amount: ethUtxo.amount,
        currency: ethUtxo.currency,
        owner: ethUtxo.owner
      }
      createdTx.transactions[0].inputs.push(ethUtxo)
      createdTx.transactions[0].outputs.push(emptyOutput)
    }

    const typedData = OmgUtil.transaction.getTypedData(createdTx.transactions[0], config.plasmaFrameworkAddress)
    const signature = await this.web3.currentProvider.send(
      'eth_signTypedData_v3',
      [
        this.web3.utils.toChecksumAddress(this.account),
        JSONBigNumber.stringify(typedData)
      ]
    );
    const signatures = new Array(createdTx.transactions[0].inputs.length).fill(signature)
    const signedTxn = this.childChain.buildSignedTransaction(typedData, signatures)
    const submittedTransaction = await this.childChain.submitTransaction(signedTxn)
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
    return this.childChain.getUtxos(this.account);
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
    const ethDeposits = _ethDeposits.map(i => {
      const status = ethBlockNumber - i.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
      const pendingPercentage = (ethBlockNumber - i.blockNumber) / depositFinality;
      return { ...i, status, pendingPercentage: (pendingPercentage * 100).toFixed() }
    });

    const _erc20Deposits = await erc20Vault.getPastEvents('DepositCreated', {
      filter: { depositor: this.account },
      fromBlock: 0
    });
    const erc20Deposits = _erc20Deposits.map(i => {
      const status = ethBlockNumber - i.blockNumber >= depositFinality ? 'Confirmed' : 'Pending';
      const pendingPercentage = (ethBlockNumber - i.blockNumber) / depositFinality;
      return { ...i, status, pendingPercentage: (pendingPercentage * 100).toFixed() }
    });

    return { eth: ethDeposits, erc20: erc20Deposits };
  }

  async getExits () {
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

    const pendingExits = allExits.filter(i => {
      const foundMatch = exitedExits.find(x => x.blockNumber === i.blockNumber);
      return !foundMatch;
    });

    return {
      pending: pendingExits,
      exited: exitedExits
    }
  }

  async exitUtxo (utxoToExit) {
    delete utxoToExit['creating_txhash'];
    delete utxoToExit['spending_txhash'];
    const exitData = await this.childChain.getExitData(utxoToExit);
    const hasToken = await this.rootChain.hasToken(utxoToExit.currency);
    if (!hasToken) {
      await this.rootChain.addToken({
        token: utxoToExit.currency,
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
