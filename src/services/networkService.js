import Web3 from 'web3';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import erc20abi from 'human-standard-token-abi';
import truncate from 'truncate-middle';
import toBn from 'number-to-bn';
import JSONBigNumber from 'json-bigint';
import config from 'config';

class NetworkService {
  constructor () {
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl });
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
        let symbol = 'ETH';
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
          amount: isEth ? this.web3.utils.fromWei(String(i.amount)) : i.amount
        }
      }
    ))

    const rootErc20Balances = await Promise.all(childchainBalances.map(
      async i => {
        const isEth = i.symbol === 'ETH';
        if (!isEth) {
          const balance = await OmgUtil.getErc20Balance({
            web3: this.web3,
            address: this.account,
            erc20Address: i.token
          })
          return {
            symbol: i.symbol,
            token: i.token,
            amount: balance
          }
        }
      }
    ))

    const _rootEthBalance = await this.web3.eth.getBalance(this.account);
    const rootchainEthBalance = {
      symbol: 'ETH',
      token: OmgUtil.transaction.ETH_CURRENCY,
      amount: this.web3.utils.fromWei(String(_rootEthBalance), 'ether')
    }

    return {
      rootchain: [rootchainEthBalance, ...rootErc20Balances.filter(i => !!i)],
      childchain: childchainBalances
    }
  }

  async deposit (value, currency) {
    if (currency === OmgUtil.transaction.ETH_CURRENCY) {
      const weiAmount = this.web3.utils.toWei(String(value), 'ether');

      const depositTx = OmgUtil.transaction.encodeDeposit(this.account, toBn(weiAmount), currency);
      return this.rootChain.depositEth({
        depositTx,
        amount: toBn(weiAmount),
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
    value = currency === OmgUtil.transaction.ETH_CURRENCY
      ? this.web3.utils.toWei(String(value))
      : value;
    feeValue = feeToken === OmgUtil.transaction.ETH_CURRENCY
      ? this.web3.utils.toWei(String(value))
      : value;

    const payments = [{
      owner: recipient,
      currency,
      amount: toBn(value)
    }]
    const fee = {
      currency: feeToken,
      amount: toBn(feeValue)
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
        .sort((a, b) => toBn(b.amount).sub(toBn(a.amount)))
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
    return submitted
  }
}

const networkService = new NetworkService();
export default networkService;
