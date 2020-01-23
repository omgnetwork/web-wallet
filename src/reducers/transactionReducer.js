const initialAuthState = {};

function transactionReducer (state = initialAuthState, action) {
  switch (action.type) {
    case 'TRANSACTION/DEPOSIT/SUCCESS':
      return { ...state, [action.payload.transactionHash]: action.payload };
    default:
      return state;
  }
}

export default transactionReducer;
