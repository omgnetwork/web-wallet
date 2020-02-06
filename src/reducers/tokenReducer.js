import networkService from 'services/networkService';

const initialState = {
  [networkService.OmgUtil.transaction.ETH_CURRENCY]: {
    currency: networkService.OmgUtil.transaction.ETH_CURRENCY,
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
