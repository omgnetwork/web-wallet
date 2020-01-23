export function createAction (key, asyncAction) {
  return function (dispatch) {
    return new Promise (async (resolve, reject) => {
      dispatch({ type: `${key}/REQUEST` })
      try {
        const response = await asyncAction();
        dispatch({ type: `${key}/SUCCESS`, payload: response });
        return resolve();
      } catch (error) {
        dispatch({ type: `${key}/ERROR`, payload: error.message || 'Unknown error' });
        return reject();
      }
    });
  }
}
