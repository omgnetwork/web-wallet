/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

const initialState = {
  depositModal: false,
  transferModal: false,
  exitModal: false,
  mergeModal: false,
  wrongNetworkModal: false,
  ledgerConnectModal: true,
  ledger: false,
  alert: null,
  error: null,
  activeHistoryTab: 'Transactions'
};

function uiReducer (state = initialState, action) {
  switch (action.type) {
    case 'UI/MODAL/OPEN':
      return { ...state, [action.payload]: true };
    case 'UI/MODAL/CLOSE':
      return { ...state, [action.payload]: false };
    case 'UI/ALERT/UPDATE':
      return { ...state, alert: action.payload };
    case 'UI/ERROR/UPDATE':
      return { ...state, error: action.payload };
    case 'UI/LEDGER/UPDATE':
      return { ...state, ledger: action.payload };
    case 'UI/HISTORYTAB/UPDATE':
      return { ...state, activeHistoryTab: action.payload };
    default:
      return state;
  }
}

export default uiReducer;
