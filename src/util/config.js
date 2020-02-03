export default {
  watcherUrl: process.env.REACT_APP_WATCHER_URL || 'http://localhost:7534',
  plasmaFrameworkAddress: process.env.REACT_APP_PLASMA_FRAMEWORK || '0xc673e4ffcb8464faff908a6804fe0e635af0ea2f',
  blockExplorerUrl: process.env.REACT_APP_BLOCKEXPLORER_URL || '',
  etherscanUrl: process.env.REACT_APP_ETHERSCAN_URL || 'https://ropsten.etherscan.io',
  checkSyncInterval: process.env.REACT_APP_SYNC_INTERVAL || 120,
  pollInterval: process.env.REACT_APP_POLL_INTERVAL || 5,
  network: process.env.REACT_APP_NETWORK || 'ropsten'
}
