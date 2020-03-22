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

import networkService from 'services/networkService';

async function sanitizeError (error) {
  // user sign rejection from metamask
  if (error.code === 4001) {
    return error.message;
  }

  // try get reason from evm error message
  if (error.message && error.message.includes('Transaction has been reverted by the EVM')) {
    try {
      const errorTx = JSON.parse(error.message.split('reverted by the EVM:')[1]);
      const reason = await networkService.OmgUtil.ethErrorReason({
        web3: networkService.web3,
        hash: errorTx.transactionHash
      });
      return reason ? reason : 'Transaction has been reverted by the EVM';
    } catch (error) {
      return 'Transaction has been reverted by the EVM';
    }
  }

  // default to original error message
  return error.message || 'Something went wrong';
}

export default sanitizeError;
