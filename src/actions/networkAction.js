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
import { createAction } from './createAction';
import store from 'store';

export function checkWatcherStatus () {
  return createAction(
    'STATUS/GET',
    () => networkService.checkStatus()
  );
}

export function fetchBalances () {
  return createAction(
    'BALANCE/GET',
    () => networkService.getBalances()
  );
}

export function fetchTransactions () {
  return createAction(
    'TRANSACTION/GETALL',
    () => networkService.getAllTransactions()
  );
}

export function fetchDeposits () {
  return createAction(
    'DEPOSIT/GETALL',
    () => networkService.getDeposits()
  );
}

export function fetchExits () {
  return createAction(
    'EXIT/GETALL',
    () => networkService.getExits()
  );
}

export function checkForExitQueue (_token) {
  return async function (dispatch) {
    const token = _token.toLowerCase();
    dispatch({ type: `QUEUE/GET_${token}/REQUEST` });
    try {
      const hasToken = await networkService.checkForExitQueue(token);
      if (hasToken) {
        const queue = await networkService.getExitQueue(token);
        dispatch({ type: `QUEUE/GET/SUCCESS`, payload: queue });
        dispatch({ type: `QUEUE/GET_${token}/SUCCESS` });
        return true;
      }
      dispatch({ type: `QUEUE/GET_${token}/SUCCESS` });
      return false;
    } catch (error) {
      dispatch({ type: 'UI/ERROR/UPDATE', payload: `Unable to check exit queue for ${token}` });
      return false;
    }
  }
}

export function getExitQueue (currency) {
  return createAction(
    'QUEUE/GET',
    () => networkService.getExitQueue(currency)
  );
}

export function addExitQueue (token) {
  return createAction(
    'QUEUE/CREATE',
    () => networkService.addExitQueue(token)
  );
}

export function exitUtxo (utxo) {
  return createAction(
    'EXIT/CREATE',
    () => networkService.exitUtxo(utxo)
  );
}

export function deposit (value, currency) {
  return createAction(
    'DEPOSIT/CREATE',
    () => networkService.deposit(value, currency)
  );
}

export function processExits (maxExits, currency) {
  return createAction(
    'QUEUE/PROCESS',
    () => networkService.processExits(maxExits, currency)
  );
}

export function transfer (data) {
  return createAction(
    'TRANSFER/CREATE',
    () => networkService.transfer(data)
  );
}

export function mergeUtxos (utxos) {
  return createAction(
    'TRANSFER/CREATE',
    () => networkService.mergeUtxos(utxos)
  );
}

export function fetchFees () {
  return async function (dispatch) {
    const state = store.getState();
    if (Object.keys(state.fees).length) {
      return;
    }

    dispatch({ type: 'FEE/GET/REQUEST' });
    try {
      const fees = await networkService.fetchFees();
      if (fees.length) {
        dispatch({
          type: 'FEE/GET/SUCCESS',
          payload: fees
        });
      }
    } catch (error) {
      console.warn('Couldnt fetch fees, retrying...');
      return;
    }
  }
}