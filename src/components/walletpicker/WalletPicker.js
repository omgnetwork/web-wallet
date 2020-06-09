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

import React, { useState, useEffect } from 'react';
import { capitalize } from 'lodash';

import Button from 'components/button/Button';
import networkService from 'services/networkService';
import logo from 'images/omg_logo.svg';
import config from 'util/config';

import * as styles from './WalletPicker.module.scss';

function WalletPicker ({ onEnable }) {
  const [ walletMethod, setWalletMethod ] = useState(null);
  const [ walletEnabled, setWalletEnabled ] = useState(false);
  const [ accountsEnabled, setAccountsEnabled ] = useState(false);

  useEffect(() => {
    async function enableBrowserWallet () {
      const walletEnabled = await networkService.enableBrowserWallet();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }
    async function enableWalletConnect () {
      const walletEnabled = await networkService.enableWalletConnect();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }
    async function enableWalletLink () {
      const walletEnabled = await networkService.enableWalletLink();
      return walletEnabled
        ? setWalletEnabled(true)
        : setWalletMethod(null);
    }

    localStorage.removeItem('walletconnect');

    if (walletMethod === 'browser') {
      enableBrowserWallet();
    }
    if (walletMethod === 'walletconnect') {
      enableWalletConnect();
    }
    if (walletMethod === 'walletlink') {
      enableWalletLink();
    }
  }, [ walletMethod ]);

  useEffect(() => {
    async function initializeAccounts () {
      const initialized = await networkService.initializeAccounts();
      return initialized
        ? setAccountsEnabled(true)
        : setAccountsEnabled(false);
    }
    if (walletEnabled) {
      initializeAccounts();
    }
  }, [ walletEnabled ]);

  useEffect(() => {
    if (accountsEnabled) {
      onEnable(true);
    }
  }, [ onEnable, accountsEnabled ]);

  function getNetworkName () {
    if (config.network === 'main') {
      return 'Main Ethereum';
    }
    return `${capitalize(config.network)} Test`;
  }

  function resetSelection () {
    setWalletMethod(null);
    setWalletEnabled(false);
    setAccountsEnabled(false);
  }

  const browserEnabled = !!window.web3 || !!window.ethereum;
  const walletConnectEnabled = !!config.rpcProxy;
  const walletLinkEnabled = !!config.rpcProxy;

  return (
    <div className={styles.WalletPicker}>
      <img src={logo} alt='logo' />

      {!walletMethod && (
        <>
          <span>Please select a wallet to connect with the OMG Network.</span>
          <div className={styles.wallets}>
            <div
              className={[
                styles.wallet,
                !browserEnabled ? styles.disabled : ''
              ].join(' ')}
              onClick={() => setWalletMethod('browser')}
            >
              <h3>Browser</h3>
              {browserEnabled && (
                <div>For use with extensions like Metamask or a built in browser wallet.</div>
              )}
              {!browserEnabled && (
                <div>Your browser does not have a web3 provider.</div>
              )}
            </div>
            <div
              className={[
                styles.wallet,
                !walletConnectEnabled ? styles.disabled : ''
              ].join(' ')}
              onClick={() => setWalletMethod('walletconnect')}
            >
              <h3>WalletConnect</h3>
              <div>Connect with a WalletConnect-compatible wallet.</div>
            </div>
            <div
              className={[
                styles.wallet,
                !walletLinkEnabled ? styles.disabled : ''
              ].join(' ')}
              onClick={() => setWalletMethod('walletlink')}
            >
              <h3>WalletLink</h3>
              <div>Use a Coinbase wallet.</div>
            </div>
          </div>
        </>
      )}

      {walletMethod === 'browser' && !walletEnabled && (
        <div className={styles.loader}>
          <span>Waiting for wallet authorization...</span>
        </div>
      )}

      {walletEnabled && !accountsEnabled && (
        <div className={styles.loader}>
          <span>Your wallet is set to the wrong network.</span>
          <span>{`Please make sure your wallet is set to the ${getNetworkName()} Network.`}</span>

          <Button
            className={styles.button}
            onClick={resetSelection}
            type='secondary'
          >
            SELECT ANOTHER WALLET
          </Button>
        </div>
      )}
    </div>
  );
}

export default React.memo(WalletPicker);
