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
import { getToken } from 'actions/tokenAction';
import BigNumber from 'bignumber.js';
import JSON5 from 'json5';

async function sanitizeError (error) {
  // user sign rejection from metamask
  if (error.code === 4001) {
    return error.message;
  }

  // ignore metamask rpc header not found errors
  if (error.code === -32000) {
    return null;
  }

  // web3 js create UTXOs error
  // Insufficient funds. Needs ${diff.toString()} more of ${i.currency} to cover payments and fees
  if (error.message.includes('Insufficient funds.')) {
    const tokenAddress = error.message.split(' ').find(i => i.startsWith('0x'))
    const token = await getToken(tokenAddress)
    const tokenAmount = error.message.split(' ').find((i) => {
      return i.match(/(?!0x)\d*/)[0] !== ""
    })
    BigNumber.set({ DECIMAL_PLACES: token.decimals })
    const decimalAmount = new Bignumber(tokenAmount)
    return `Insufficient funds, Needs ${decimalAmount.toString()} more of ${tokenAddress} to cover payments and fee` 
  }

  // try get reason from evm error message
  const revertedMessage = 'Transaction has been reverted by the EVM:';
  if (error.message && error.message.includes(revertedMessage)) {
    try {
      const errorTx = JSON5.parse(error.message.split(revertedMessage)[1]);
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
