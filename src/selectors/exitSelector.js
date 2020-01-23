export function selectPendingExits (state) {
  return state.exit.pending;
}

export function selectProcessableExits (state) {
  return state.exit.processable;
}

export function selectExitedExits (state) {
  return state.exit.exited;
}

