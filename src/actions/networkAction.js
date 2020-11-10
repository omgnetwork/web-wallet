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
import { WebWalletError } from 'services/errorService';

import { createAction } from './createAction';
import { openError } from './uiAction';
import store from 'store';

export function checkWatcherStatus () {
  return createAction(
    'STATUS/GET',
    () => networkService.checkStatus()
  );
}

export function fetchEthStats () {
  return createAction(
    'ETHSTATS/GET',
    () => networkService.getEthStats()
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

export function checkPendingDepositStatus () {
  return createAction(
    'DEPOSIT/CHECKALL',
    () => networkService.checkPendingDepositStatus()
  );
}

export function checkPendingExitStatus () {
  return createAction(
    'EXIT/CHECKALL',
    () => networkService.checkPendingExitStatus()
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
        dispatch({ type: 'QUEUE/GET/SUCCESS', payload: queue });
        dispatch({ type: `QUEUE/GET_${token}/SUCCESS` });
        return true;
      }
      dispatch({ type: `QUEUE/GET_${token}/SUCCESS` });
      return false;
    } catch (error) {
      dispatch(openError(`Unable to check exit queue for ${token}`));
      return false;
    }
  };
}

export function getExitQueue (currency) {
  return createAction(
    'QUEUE/GET',
    () => networkService.getExitQueue(currency)
  );
}

export function addExitQueue (token, gasPrice) {
  return createAction(
    'QUEUE/CREATE',
    () => networkService.addExitQueue(token, gasPrice)
  );
}

export function exitUtxo (utxo, gasPrice) {
  return createAction(
    'EXIT/CREATE',
    () => networkService.exitUtxo(utxo, gasPrice)
  );
}

export function depositEth (value, gasPrice) {
  return createAction(
    'DEPOSIT/CREATE',
    () => networkService.depositEth(value, gasPrice)
  );
}

export function approveErc20 (value, currency, gasPrice) {
  return createAction(
    'APPROVE/CREATE',
    () => networkService.approveErc20(value, currency, gasPrice)
  );
}

export function resetApprove (value, currency, gasPrice) {
  return createAction(
    'APPROVE/RESET',
    () => networkService.resetApprove(value, currency, gasPrice)
  );
}

export function depositErc20 (value, currency, gasPrice) {
  return createAction(
    'DEPOSIT/CREATE',
    () => networkService.depositErc20(value, currency, gasPrice)
  );
}

export function processExits (maxExits, currency, gasPrice) {
  return createAction(
    'QUEUE/PROCESS',
    () => networkService.processExits(maxExits, currency, gasPrice)
  );
}

export function transfer (data) {
  return createAction(
    'TRANSFER/CREATE',
    () => networkService.transfer(data)
  );
}

export function getTransferTypedData (data) {
  return async function (dispatch) {
    try {
      const response = await networkService.getTransferTypedData(data);
      return response;
    } catch (error) {
      dispatch({ type: 'TRANSFER_TYPED/ERROR' });
      const _error = error instanceof WebWalletError
        ? error
        : new WebWalletError({
          originalError: error,
          customErrorMessage: 'Something went wrong',
          reportToSentry: true,
          reportToUi: true
        });
      _error.report(dispatch);
    }
  };
}

export function mergeUtxos (useLedgerSign, utxos) {
  return createAction(
    'TRANSFER/CREATE',
    () => networkService.mergeUtxos(useLedgerSign, utxos)
  );
}

export function fetchGas () {
  return createAction(
    'GAS/GET',
    () => networkService.getGasPrice()
  );
}

export function fetchFees () {
  return async function (dispatch) {
    // only makes the call if fee fetch not successful before
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
  };
}
