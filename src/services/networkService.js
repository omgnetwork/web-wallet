import Web3 from 'web3';
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
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      try {
        await window.ethereum.enable();
        return true;
      } catch {
        return false;
      }
    }

    if (window.web3) {
      this.web3 = new Web3(window.web3.currentProvider, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: config.plasmaFrameworkAddress });
      const accounts = await this.web3.eth.getAccounts();
      this.account = accounts[0];
      return true;
    }
    return false;
  }

  async getBalances () {
    if (!this.account) return;
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
      rootchain: [rootchainEthBalance, ...rootErc20Balances.filter(i => !!i)],
      childchain: childchainBalances
    }
  }

  async deposit (value, currency) {
    if (currency === OmgUtil.transaction.ETH_CURRENCY) {
      const depositTx = OmgUtil.transaction.encodeDeposit(this.account, new BN(value), currency);
      return this.rootChain.depositEth({
        depositTx,
        amount: new BN(value),
        txOptions: { from: this.account, gas: 6000000 }
      });
    }

    await this.rootChain.approveToken({
      erc20Address: currency,
      amount: value,
      txOptions: { from: this.account, gas: 6000000 }
    })

    const depositTx = OmgUtil.transaction.encodeDeposit(this.account, value, currency);
    return this.rootChain.depositToken({
      depositTx,
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
    const _metadata = metadata ? OmgUtil.transaction.encodeMetadata(metadata) : OmgUtil.transaction.NULL_METADATA
    const createdTx = await this.childChain.createTransaction({
      owner: this.account,
      payments,
      fee,
      metadata: _metadata
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

    const typedData = OmgUtil.transaction.getTypedData(createdTx.transactions[0], currency)
    const signature = await this.web3.currentProvider.send(
      'eth_signTypedData_v3',
      [
        this.web3.utils.toChecksumAddress(this.account),
        JSONBigNumber.stringify(typedData)
      ]
    );
    const signatures = new Array(createdTx.transactions[0].inputs.length).fill(signature)
    const signedTxn = this.childChain.buildSignedTransaction(typedData, signatures)
    const submitted = await this.childChain.submitTransaction(signedTxn)
    return submitted;
  }

  async getUtxos () {
    return this.childChain.getUtxos(this.account);
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
}

const networkService = new NetworkService();
export default networkService;
