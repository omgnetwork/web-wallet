# Web Wallet

[![CircleCI](https://circleci.com/gh/omisego/web-wallet.svg?style=svg)](https://circleci.com/gh/omisego/web-wallet)

This is an example client side wallet built with React.js which allows you to make interactions with the OMG network from the browser.
To run this application locally, make sure you have a local instance of elixir-omg running or have access to an already deployed network.

- This example application is using [`omg-js`](https://github.com/omgnetwork/omg-js)
- Requires Node 12.16.1

## Initial Setup

Make sure you have access to a Watcher endpoint. The wallet also requires an in-browser web3 wallet like MetaMask to sign transactions.

1. Install dependencies by running `yarn install` from the root

2. Create a `.env` file in the root and add your configuration.
```env
REACT_APP_WATCHER_URL=        the watcher url
REACT_APP_PLASMA_ADDRESS=     the plasma framework address
REACT_APP_BLOCKEXPLORER_URL=  the block explorer url 
REACT_APP_ETHERSCAN_URL=      the etherscan url (https://etherscan.io, etc.)
REACT_APP_SYNC_INTERVAL=      max seconds watcher has to sync to ethereum before blocking further transactions
REACT_APP_POLL_INTERVAL=      number of seconds to poll account data
REACT_APP_NETWORK=            the network your environment is on (ropsten, rinkeby, private, main, etc.)
REACT_APP_SENTRY_DSN=         *optional* sentry dsn handler
REACT_APP_GTM_ID=             *optional* google tag manager id (GTM-XXXXXXX)
REACT_APP_RPC_PROXY=          *optional, required for WalletConnect support* rpc url for connection to a remote ethereum node
```

3. Start the app by running `yarn start` from the root directory.

4. Run the tests by running `yarn test` from the root directory.

## Running the wallet

Open up your browser and navigate to `http://localhost:3000`, Make sure your Metamask is currently unlocked. You should be able to see your account balance on both the Root chain and Child chain.

From here, you can perform these actions:

1. Deposit into the OMG Network.

2. Transfer funds on the OMG Network.

3. Exit your funds back to the Rootchain.

4. If the challenge period has passed, your exit will exist in an exit queue of that token. You can call process exits on this queue to receive your funds back.
