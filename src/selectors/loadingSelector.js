export function selectLoading (requestNames) {
  return function (state) {
    return requestNames.some(name => state.loading[name])
  }
}
