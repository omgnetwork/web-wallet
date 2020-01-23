const initialState = {};

function rcTransactionReducer (state = initialState, action) {
  switch (action.type) {
    case 'RC_TRANSACTION/DEPOSIT/SUCCESS':
      return { ...state, [action.payload.transactionHash]: action.payload };
    default:
      return state;
  }
}

export default rcTransactionReducer;
