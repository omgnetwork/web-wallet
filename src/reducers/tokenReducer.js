const eth = '0x0000000000000000000000000000000000000000'
const initialState = {
  [eth]: {
    currency: eth,
    decimals: 18,
    name: 'ETH',
    icon: 'ether.png'
  }
};

function tokenReducer (state = initialState, action) {
  switch (action.type) {
    case 'TOKEN/GET/SUCCESS':
      return { ...state, [action.payload.currency]: action.payload };
    default:
      return state;
  }
}

export default tokenReducer;
