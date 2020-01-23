import { combineReducers } from 'redux';

import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';
import rcTransactionReducer from './rcTransactionReducer';
import ccTransactionReducer from './ccTransactionReducer';
import statusReducer from './statusReducer';
import balanceReducer from './balanceReducer';

const rootReducer = combineReducers({
  loading: loadingReducer,
  error: errorReducer,
  rcTransaction: rcTransactionReducer,
  ccTransaction: ccTransactionReducer,
  status: statusReducer,
  balance: balanceReducer
});

export default rootReducer;
