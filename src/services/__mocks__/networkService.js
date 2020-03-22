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
  checkStatus: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  getBalances: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  getAllTransactions: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  getDeposits: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  getExits: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  checkForExitQueue: jest.fn(() => new Promise((resolve, reject) => resolve(true))),
  getExitQueue: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  addExitQueue: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  exitUtxo: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  deposit: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  processExits: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  transfer: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  mergeUtxos: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  getGasPrice: jest.fn(() => new Promise((resolve, reject) => resolve('toto'))),
  fetchFees: jest.fn(() => new Promise((resolve, reject) => resolve([1, 2, 3]))),
};

export default networkService;
