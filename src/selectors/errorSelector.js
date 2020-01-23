export function selectAllErrors () {
  return function (state) {
    return state.error;
  }
}
