# react-starter-kit

[![Netlify Status](https://api.netlify.com/api/v1/badges/21aadcdd-99f2-4ddd-be65-7797c0ca1cdc/deploy-status)](https://app.netlify.com/sites/omgnetwork-browser-wallet/deploys)

This is an example client side wallet built in React.js which allows you to make interactions with the OMG network from the browser.
To run this application locally, make sure you have a local instance of elixir-omg running or have access to an already deployed network.

- This example application is using [`omg-js v3.0.0-alpha.16`](https://github.com/omisego/omg-js)

## Initial Setup

Make sure you have access to a Watcher endpoint, and the address of the deployed Plasma Contract. The wallet also requires an in-browser web3 wallet like MetaMask to sign transactions.

1. Install dependencies by running `yarn install` from the root

2. Create a `.env` file in the root and add your configuration.
```env
REACT_APP_WATCHER_URL=        the watcher url
REACT_APP_PLASMA_FRAMEWORK=   the plasma framework contract address
REACT_APP_BLOCKEXPLORER_URL=  the block explorer url 
REACT_APP_ETHERSCAN_URL=      the etherscan url 
REACT_APP_SYNC_INTERVAL=      max seconds watcher has to sync to ethereum before considered stalled
REACT_APP_POLL_INTERVAL=      number of seconds to poll account data
```

3. Start the app by running `yarn start` from the root directory.

## Running the starter-kit

Open up your browser and navigate to `http://localhost:3000`, Make sure your Metamask is currently unlocked. You should be able to see your account balance on both the Root chain and Child chain.

From here, you can perform 3 actions:

1. Deposit into the OMG Network: After 10 blocks confirmations, your Rootchain balance will be updated.

2. Transfer funds on the OMG Network: Fill in the values for the Transfer fields and click Transfer. Depending on network congestion, you may have to wait for a little while for the transaction to be included in a block.

3. Exit your funds back to Rootchain: select a UTXO to exit click on Submit Exit. The exit period will begin after a successful transaction. Do note that the exit period will be varied depending on the deployed contract environment. After the specified amount of time has passed, you will be able to process the exit and receive your funds back.

4. If the challenge period has passed, your exit will exist in an exit queue of that token. You can call process exits on this queue to receive your funds back.
