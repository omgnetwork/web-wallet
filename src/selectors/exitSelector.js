export function selectPendingExits (state) {
  return state.exit.pending;
}

export function selectExitedExits (state) {
  return state.exit.exited;
}
