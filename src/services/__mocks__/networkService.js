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

const networkService = {
  OmgUtil: {
    ethErrorReason: jest.fn().mockImplementationOnce(() => Promise.resolve('toto'))
  },
  web3: {
    eth: {
      Contract: function () {
        return {
          methods: {
            symbol: () => ({
              call: jest.fn(() => Promise.resolve('OMG'))
            }),
            decimals: () => ({
              call: jest.fn(() => Promise.resolve(18))
            })
          }
        };
      }
    }
  },
  checkStatus: () => Promise.resolve('toto'),
  getBalances: () => Promise.resolve('toto'),
  getAllTransactions: () => Promise.resolve('toto'),
  getDeposits: () => Promise.resolve('toto'),
  getExits: () => Promise.resolve('toto'),
  checkForExitQueue: () => Promise.resolve(true),
  getExitQueue: () => Promise.resolve('toto'),
  addExitQueue: () => Promise.resolve('toto'),
  exitUtxo: () => Promise.resolve('toto'),
  depositEth: () => Promise.resolve('toto'),
  processExits: () => Promise.resolve('toto'),
  transfer: () => Promise.resolve('toto'),
  mergeUtxos: () => Promise.resolve('toto'),
  getGasPrice: () => Promise.resolve('toto'),
  fetchFees: () => Promise.resolve([ 1, 2, 3 ])
};

export default networkService;
