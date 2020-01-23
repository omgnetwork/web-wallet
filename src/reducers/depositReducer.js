const initialState = {
  eth: [],
  erc20: []
};

function depositReducer (state = initialState, action) {
  switch (action.type) {
    case 'DEPOSIT/GETALL/SUCCESS':
      const { eth, erc20 } = action.payload;
      return { ...state, eth, erc20 };
    default:
      return state;
  }
}

export default depositReducer;
