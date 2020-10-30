# Web Wallet

[![CircleCI](https://circleci.com/gh/omgnetwork/web-wallet.svg?style=svg)](https://circleci.com/gh/omgnetwork/web-wallet)

This is an example client side wallet built with React.js which allows you to make interactions with the OMG network from the browser.
To run this application locally, make sure you have a local instance of elixir-omg running or have access to an already deployed network.

- This example application is using [`omg-js`](https://github.com/omgnetwork/omg-js)
- Requires Node 12.16.1

## Initial Setup

1. Install dependencies by running `npm install` from the root

2. Create a `.env` file in the root and add your configuration. See `.env.template` for an example with fake variables.

```env
REACT_APP_WATCHER_URL=        the watcher url
REACT_APP_PLASMA_ADDRESS=     the plasma framework address
REACT_APP_BLOCKEXPLORER_URL=  the block explorer url 
REACT_APP_ETHERSCAN_URL=      the etherscan url (https://etherscan.io, etc.)
REACT_APP_SYNC_INTERVAL=      max number of blocks that watcher has to sync to the child chain before allowing further transactions
REACT_APP_POLL_INTERVAL=      number of seconds to poll account data
REACT_APP_NETWORK=            the network your environment is on (ropsten, rinkeby, private, main, etc.)
REACT_APP_ALTERNATE_WALLETS=  *optional* other web wallets hosted on different envs, follow this format -> name,url|name,url|name,url
REACT_APP_SENTRY_DSN=         *optional* sentry dsn handler
REACT_APP_GTM_ID=             *optional* google tag manager id (GTM-XXXXXXX)
REACT_APP_RPC_PROXY=          *optional, required for WalletConnect support* rpc url for connection to a remote ethereum node
```

3. Make sure you are using the correct version of Node

4. Start the app by running `npm run start` from the root directory.

## Running the wallet locally

Open up your browser and navigate to `http://localhost:3000`. 

From here, you can perform these actions:

1. Deposit into the OMG Network.

2. Transfer funds on the OMG Network.

3. Exit your funds back to the Rootchain.

4. Process exits to receive your funds back on the Rootchain.
