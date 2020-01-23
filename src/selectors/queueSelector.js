export function selectQueue (currency) {
  return function (state) {
    return state.queue[currency];
  }
}
