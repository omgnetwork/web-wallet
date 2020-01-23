import { combineReducers } from 'redux';

import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';
import depositReducer from './depositReducer';
import transactionReducer from './transactionReducer';
import statusReducer from './statusReducer';
import balanceReducer from './balanceReducer';
import exitReducer from './exitReducer';
import queueReducer from './queueReducer';

const rootReducer = combineReducers({
  loading: loadingReducer,
  error: errorReducer,
  deposit: depositReducer,
  transaction: transactionReducer,
  status: statusReducer,
  balance: balanceReducer,
  exit: exitReducer,
  queue: queueReducer
});

export default rootReducer;
