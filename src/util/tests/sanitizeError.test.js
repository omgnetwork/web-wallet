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

import sanitizeError from 'util/sanitizeError';

describe('sanitizeError', () => {
  it('should return metamask unsign error', async () => {
    const error = {
      code: 4001,
      message: 'MetaMask Tx Signature: User denied transaction signature'
    };
    const res = await sanitizeError(error);
    expect(res).toBe(error.message);
  });

  it('should return sensible error on EVM error', async () => {
    const error = {
      message: "Error: Transaction has been reverted by the EVM: {'blockHash': '0x9695b98f4e55b98103bb1282dfffbcbddac03002b1199789ea0f027b1baee09f', 'blockNumber': 2775473, 'contractAddress': null, 'cumulativeGasUsed': 1755656, 'from': '0xdc091bc86e95ae492cdd67abf051e7c7e3432d70', 'gasUsed': 24017, 'logsBloom': '0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000', 'status': false, 'to': '0xe0ef5f6d4b4f75f66bb96713c17549c1ded4af98', 'transactionHash': '0xaed58f7d6c230f41b30c2d6f45e057e4d63188fa1542540767ee90aa9f567ba8', 'transactionIndex': 18, 'events': {}}"
    };
    const res = await sanitizeError(error);
    expect(res).toBe('Transaction has been reverted by the EVM');
  });

  it('should return message if other conditions unmet', async () => {
    const error = {
      code: 1337,
      message: 'hello world'
    };
    const res = await sanitizeError(error);
    expect(res).toBe(error.message);
  });

  it('should not crash on unusual error', async () => {
    const error = { foo: 'bar' };
    const res = await sanitizeError(error);
    expect(res).toBe('Something went wrong');
  });
});