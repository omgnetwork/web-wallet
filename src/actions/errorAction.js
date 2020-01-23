export function clearError (error) {
  return function (dispatch) {
    if (Object.keys(error).length) {
      return dispatch({ type: `${Object.keys(error)[0]}/ERROR`, payload: null });
    }
  }
};
