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

export function fetchExits () {
  return createAction(
    'EXIT/GETALL',
    () => networkService.getExits()
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

export function getExitQueue (currency) {
  return createAction(
    'QUEUE/LENGTH',
    () => networkService.getExitQueue(currency)
  );
}
