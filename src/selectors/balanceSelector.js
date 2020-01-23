export function selectRootchainBalance (state) {
  return state.balance.rootchain;
}

export function selectChildchainBalance (state) {
  return state.balance.childchain;
}
