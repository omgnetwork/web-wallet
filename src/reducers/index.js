import { combineReducers } from 'redux';

import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';
import transactionReducer from './transactionReducer';
import statusReducer from './statusReducer';
import balanceReducer from './balanceReducer';

const rootReducer = combineReducers({
  loading: loadingReducer,
  error: errorReducer,
  transaction: transactionReducer,
  status: statusReducer,
  balance: balanceReducer
});

export default rootReducer;
