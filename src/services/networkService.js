import Web3 from 'web3';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import erc20abi from 'human-standard-token-abi';
import truncate from 'truncate-middle';
import toBn from 'number-to-bn';
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

  async getBalances (account) {
    const _childchainBalances = await this.childChain.getBalance(account);
    const childchainBalances = await Promise.all(_childchainBalances.map(
      async i => {
        const isEth = i.currency === OmgUtil.transaction.ETH_CURRENCY
        let currency = 'ETH';
        if (!isEth) {
          const tokenContract = new this.web3.eth.Contract(erc20abi, i.currency);
          try {
            const _currency = await tokenContract.methods.symbol().call();
            currency = _currency || truncate(i.currency, 6, 4, '...');
          } catch (err) {
            currency = truncate(i.currency, 6, 4, '...');
          }
        }
        return {
          currency,
          token: i.currency,
          amount: isEth ? this.web3.utils.fromWei(String(i.amount)) : i.amount
        }
      }
    ))

    const rootErc20Balances = await Promise.all(childchainBalances.map(
      async i => {
        const isEth = i.currency === 'ETH';
        if (!isEth) {
          const balance = await OmgUtil.getErc20Balance({
            web3: this.web3,
            address: account,
            erc20Address: i.token
          })
          return {
            currency: i.currency,
            amount: balance
          }
        }
      }
    ))

    const _rootEthBalance = await this.web3.eth.getBalance(account);
    const rootchainEthBalance = {
      currency: 'ETH',
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

      const depositTx = OmgUtil.transaction.encodeDeposit(this.account, weiAmount, currency);
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
}

const networkService = new NetworkService();
export default networkService;
