import Web3 from 'web3';
import { ChildChain, RootChain, OmgUtil } from '@omisego/omg-js';
import erc20abi from 'human-standard-token-abi';
import truncate from 'truncate-middle';
import config from 'config';

class NetworkService {
  constructor () {
    this.childChain = new ChildChain({ watcherUrl: config.watcherUrl });
  }

  async enableNetwork () {
    if (window.ethereum) {
      this.web3 = new Web3(window.ethereum, null, { transactionConfirmationBlocks: 1 });
      this.rootChain = new RootChain({ web3: this.web3, plasmaContractAddress: config.plasmaFrameworkAddress });
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
      return true;
    }
    return false;
  }

  getAccounts () {
    return this.web3.eth.getAccounts();
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
}

const networkService = new NetworkService();
export default networkService;
