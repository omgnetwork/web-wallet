import Web3 from 'web3';
import { ChildChain, RootChain } from '@omisego/omg-js';
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
}

const networkService = new NetworkService();
export default networkService;
