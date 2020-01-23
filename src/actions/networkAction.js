import networkService from 'services/networkService';
import { createAction } from './createAction';

export function deposit (value, currency) {
  return createAction(
    'TRANSACTION/DEPOSIT',
    () => networkService.deposit(value, currency)
  );
}
