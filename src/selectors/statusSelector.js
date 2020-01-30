export function selectConnection (state) {
  return state.status.connection;
}

export function selectByzantine (state) {
  return state.status.byzantine;
}

export function selectLastSync (state) {
  return state.status.secondsSinceLastSync;
}

export function selectLastSeenBlock (state) {
  return state.status.lastSeenBlock;
}
