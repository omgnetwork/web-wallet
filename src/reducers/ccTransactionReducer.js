import { keyBy } from 'lodash';
const initialState = {};

function ccTransactionReducer (state = initialState, action) {
  switch (action.type) {
    case 'CC_TRANSACTION/GETALL/SUCCESS':
      return { ...state, ...keyBy(action.payload, 'txhash') };
    default:
      return state;
  }
}

export default ccTransactionReducer;
