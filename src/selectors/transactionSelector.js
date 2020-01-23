export function selectChildchainTransactions (state) {
  return Object.values(state.transaction);
}

export function selectErc20Deposits (state) {
  return state.deposit.erc20;
}

export function selectEthDeposits (state) {
  return state.deposit.eth;
}
