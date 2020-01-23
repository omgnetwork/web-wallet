export function selectChildchainTransactions (state) {
  return Object.values(state.ccTransaction);
}

export function selectRootchainTransactions (state) {
  return Object.values(state.rcTransaction);
}

export function selectDeposits (state) {
  return Object.values(state.deposit);
}
