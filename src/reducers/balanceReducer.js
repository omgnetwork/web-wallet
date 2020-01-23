const initialState = {
  rootchain: [],
  childchain: []
};

function balanceReducer (state = initialState, action) {
  switch (action.type) {
    case 'BALANCE/GET/SUCCESS':
      const { rootchain, childchain } = action.payload;
      return { ...state, rootchain, childchain };
    default:
      return state;
  }
}

export default balanceReducer;
