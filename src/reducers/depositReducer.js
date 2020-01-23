const initialState = {};

function depositReducer (state = initialState, action) {
  switch (action.type) {
    case 'DEPOSIT/CREATE/SUCCESS':
      return { ...state, [action.payload.transactionHash]: action.payload };
    default:
      return state;
  }
}

export default depositReducer;
