export function selectConnection (state) {
  return state.status.connection;
}

export function selectByzantine (state) {
  return state.status.byzantine;
}
