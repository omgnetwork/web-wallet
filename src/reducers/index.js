import { combineReducers } from 'redux';

import transactionReducer from './transactionReducer';
import loadingReducer from './loadingReducer';
import errorReducer from './errorReducer';

const rootReducer = combineReducers({
  transaction: transactionReducer,
  loading: loadingReducer,
  error: errorReducer
});

export default rootReducer;
