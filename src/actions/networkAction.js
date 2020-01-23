import networkService from 'services/networkService';
import { createAction } from './createAction';

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
    'CC_TRANSACTION/GETALL',
    () => networkService.getAllTransactions()
  );
}

export function deposit (value, currency) {
  return createAction(
    'RC_TRANSACTION/DEPOSIT',
    () => networkService.deposit(value, currency)
  );
}
