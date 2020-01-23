const initialErrorState = {};

function errorReducer (state = initialErrorState, action) {
  const segments = action.type.split('/');
  const requestName = `${segments[0]}/${segments[1]}`;
  const requestState = segments[2];

  if (
    requestState !== 'REQUEST' &&
    requestState !== 'SUCCESS' &&
    requestState !== 'ERROR'
  ) {
    return state
  }

  return {
    ...state,
    [requestName]: requestState === 'ERROR' ? action.payload : null
  }
}

export default errorReducer;
