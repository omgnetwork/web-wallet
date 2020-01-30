const initialState = {
  connection: false,
  byzantine: false
};

function statusReducer (state = initialState, action) {
  switch (action.type) {
    case 'STATUS/GET/SUCCESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default statusReducer;
