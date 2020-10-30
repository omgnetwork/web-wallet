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

import erc20abi from 'human-standard-token-abi';
import networkService from 'services/networkService';
import truncate from 'truncate-middle';
import store from 'store';

export async function getToken (_currency) {
  const currency = _currency.toLowerCase();

  const state = store.getState();
  if (state.token[currency]) {
    return state.token[currency];
  }

  const tokenContract = new networkService.web3.eth.Contract(erc20abi, currency);
  const callOptions = { from: currency };
  const [ _name, _decimals ] = await Promise.all([
    tokenContract.methods.symbol().call(callOptions),
    tokenContract.methods.decimals().call(callOptions)
  ]).catch(e => [ null, null ]);

  const decimals = _decimals ? Number(_decimals.toString()) : 0;
  const name = _name || truncate(currency, 6, 4, '...');

  const tokenInfo = {
    currency,
    decimals,
    name
  };

  store.dispatch({
    type: 'TOKEN/GET/SUCCESS',
    payload: tokenInfo
  });
  return tokenInfo;
}
