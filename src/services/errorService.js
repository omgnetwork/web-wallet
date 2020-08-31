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

import * as Sentry from '@sentry/react';
import networkService from 'services/networkService';
import { getToken } from 'actions/tokenAction';
import { logAmount } from 'util/amountConvert';
import JSON5 from 'json5';
import config from 'util/config';

if (config.sentry) {
  Sentry.init({ dsn: config.sentry });
}

// skip error logging
const noLogErrors = [
  'user denied',
  'user rejected',
  'server is not ready to handle the request',
  'insufficient funds',
  'network error',
  'transaction has been reverted'
];

// used to prevent error spam from a single session
const errorCache = [];

class ErrorService {
  log (error) {
    // skip logging if in defined list
    for (const i of noLogErrors) {
      if (error.message.toLowerCase().includes(i)) {
        return;
      }
    }

    if (config.sentry) {
      if (errorCache.includes(error.message)) {
        // if message already seen in this session, ignore it
        return;
      }
      errorCache.push(error.message);
      Sentry.captureException(error);
    }
  }

  async sanitizeError (error) {
    // user sign rejection from metamask
    if (
      error.message && error.message.toLowerCase().includes('user denied') ||
      error.message && error.message.toLowerCase().includes('user rejected')
    ) {
      return null;
    }

    // ignore metamask rpc header not found errors
    if (error.code === -32000) {
      return null;
    }

    // omg-js create UTXOs insufficient funds error
    if (error.message && error.message.includes('Insufficient funds. Needs ')) {
      try {
        const tokenAddress = error.message.split(' ').find(i => i.startsWith('0x'));
        const { decimals, name } = await getToken(tokenAddress);
        const tokenAmount = error.message.split(' ').find((i) => {
          return i.match(/(?!0x)\d*/)[0] !== '';
        });
        const decimalAmount = logAmount(tokenAmount, decimals);
        return 'Insufficient funds. Needs '.concat(decimalAmount.toString(), ' more of ', name, ' to cover payments and fees');
      }  catch (error) {
        return 'Insufficient funds to cover payments and fees';
      }
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
}

const errorService = new ErrorService();
export default errorService;
