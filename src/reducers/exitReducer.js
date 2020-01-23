const initialState = {
  pending: [],
  processable: [],
  exited: []
};

function exitReducer (state = initialState, action) {
  switch (action.type) {
    case 'EXIT/GETALL/SUCCESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export default exitReducer;
