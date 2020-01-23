export function selectChildchainTransactions (state) {
  return Object.values(state.transaction);
}

export function selectDeposits (state) {
  return Object.values(state.deposit);
}
