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

export default {
  watcherUrl: process.env.REACT_APP_WATCHER_URL || 'http://localhost:7534',
  plasmaAddress: process.env.REACT_APP_PLASMA_ADDRESS || '',
  blockExplorerUrl: process.env.REACT_APP_BLOCKEXPLORER_URL || '',
  etherscanUrl: process.env.REACT_APP_ETHERSCAN_URL || 'https://ropsten.etherscan.io',
  checkSyncInterval: process.env.REACT_APP_SYNC_INTERVAL || 120,
  pollInterval: process.env.REACT_APP_POLL_INTERVAL || 5,
  network: process.env.REACT_APP_NETWORK || 'ropsten',
  sentry: process.env.REACT_APP_SENTRY_DSN
}
