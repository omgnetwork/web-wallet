const initialState = {
  connection: false,
  byzantine: false
};

function statusReducer (state = initialState, action) {
  switch (action.type) {
    case 'STATUS/GET/SUCCESS':
      const { byzantine_events } = action.payload;
      return {
        ...state,
        connection: !!byzantine_events,
        byzantine: !!byzantine_events.length
      };
    default:
      return state;
  }
}

export default statusReducer;
