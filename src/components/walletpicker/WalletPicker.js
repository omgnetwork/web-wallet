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

import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import WrongNetworkModal from 'containers/modals/wrongnetwork/WrongNetworkModal';
import networkService from 'services/networkService';
import { selectModalState } from 'selectors/uiSelector';
import { selectWalletMethod } from 'selectors/setupSelector';
import { openModal } from 'actions/uiAction';
import { setWalletMethod } from 'actions/setupAction';
import { getShortNetworkName, getAlternateNetworks } from 'util/networkName';
import config from 'util/config';

import logo from 'images/omg_logo.svg';
import chevron from 'images/chevron.svg';
import browserwallet from 'images/browserwallet.png';
import coinbase from 'images/coinbase.jpg';
import walletconnect from 'images/walletconnect.png';

import * as styles from './WalletPicker.module.scss';

function WalletPicker ({ onEnable }) {
  const dispatch = useDispatch();
  const dropdownNode = useRef(null);

  const [ walletEnabled, setWalletEnabled ] = useState(false);
  const [ accountsEnabled, setAccountsEnabled ] = useState(false);
  const [ wrongNetwork, setWrongNetwork ] = useState(false);
  const [ showAlternateNetworks, setShowAlternateNetworks ] = useState(false);

  const walletMethod = useSelector(selectWalletMethod());
  const wrongNetworkModalState = useSelector(selectModalState('wrongNetworkModal'));

  const dispatchSetWalletMethod = useCallback((methodName) => {
    dispatch(setWalletMethod(methodName));
  }, [ dispatch ]);

  useEffect(() => {
    async function enableBrowserWallet () {
      const walletEnabled = await networkService.enableBrowserWallet();
      return walletEnabled
        ? setWalletEnabled(true)
        : dispatchSetWalletMethod(null);
    }
    async function enableWalletConnect () {
      const walletEnabled = await networkService.enableWalletConnect();
      return walletEnabled
        ? setWalletEnabled(true)
        : dispatchSetWalletMethod(null);
    }
    async function enableWalletLink () {
      const walletEnabled = await networkService.enableWalletLink();
      return walletEnabled
        ? setWalletEnabled(true)
        : dispatchSetWalletMethod(null);
    }
    async function enableLedger () {
      const walletEnabled = await networkService.enableLedger();
      return walletEnabled
        ? setWalletEnabled(true)
        : dispatchSetWalletMethod(null);
    }

    // clean storage of any references
    for (const _key in localStorage) {
      const key = _key.toLowerCase();
      if (key.includes('walletlink') || key.includes('walletconnect')) {
        localStorage.removeItem(_key);
      }
    }

    if (walletMethod === 'browser') {
      enableBrowserWallet();
    }
    if (walletMethod === 'walletconnect') {
      enableWalletConnect();
    }
    if (walletMethod === 'walletlink') {
      enableWalletLink();
    }
    if (walletMethod === 'ledger') {
      enableLedger();
    }
  }, [ dispatchSetWalletMethod, walletMethod ]);

  useEffect(() => {
    async function initializeAccounts () {
      const initialized = await networkService.initializeAccounts();
      if (!initialized) {
        return setAccountsEnabled(false);
      }
      if (initialized === 'wrongnetwork') {
        setAccountsEnabled(false);
        return setWrongNetwork(true);
      }
      if (initialized === 'enabled') {
        return setAccountsEnabled(true);
      }
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

  useEffect(() => {
    if (walletEnabled && wrongNetwork) {
      dispatch(openModal('wrongNetworkModal'));
    }
  }, [ dispatch, walletEnabled, wrongNetwork ]);

  useEffect(() => {
    function handleClick (e) {
      if (!dropdownNode.current.contains(e.target)) {
        setShowAlternateNetworks(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function resetSelection () {
    dispatchSetWalletMethod(null);
    setWalletEnabled(false);
    setAccountsEnabled(false);
  }

  const browserEnabled = !!window.ethereum;
  const walletConnectEnabled = !!config.rpcProxy;
  const walletLinkEnabled = !!config.rpcProxy;
  // const ledgerEnabled = !!config.rpcProxy;

  const alternateNetworks = getAlternateNetworks();

  return (
    <>
      <WrongNetworkModal
        open={wrongNetworkModalState}
        onClose={resetSelection}
      />

      <div className={styles.WalletPicker}>
        <div className={styles.title}>
          <img src={logo} alt='logo' />
          <div className={styles.menu}>
            <a
              href='https://docs.omg.network/wallet/web-wallet-quick-start'
              target='_blank'
              rel='noopener noreferrer'
            >
              About
            </a>

            <div
              onClick={() => setShowAlternateNetworks(prev => !prev)}
              className={styles.network}
            >
              <div className={styles.indicator} />
              <div>
                OMG Network:&nbsp;
                {getShortNetworkName()}
              </div>
              {!!alternateNetworks.length && (
                <img
                  src={chevron}
                  alt='chevron'
                  className={[
                    styles.chevron,
                    showAlternateNetworks ? styles.open : ''
                  ].join(' ')}
                />
              )}
            </div>

            <div ref={dropdownNode} className={styles.dropdown}>
              {!!alternateNetworks.length && showAlternateNetworks && alternateNetworks.map((network, index) => (
                <a key={index} href={network.url}>
                  {network.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <span className={styles.directive}>
          Select how you want to connect with the OMG Network.
        </span>
        <div className={styles.wallets}>
          <div
            className={[
              styles.wallet,
              !browserEnabled ? styles.disabled : ''
            ].join(' ')}
            onClick={() => dispatchSetWalletMethod('browser')}
          >
            <img src={browserwallet} alt='browserwallet' />
            <h3>Browser Wallet</h3>
            {browserEnabled && (
              <div>
                Use a browser wallet extension (e.g. Metamask) or a built-in browser wallet.
              </div>
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
            onClick={() => dispatchSetWalletMethod('walletconnect')}
          >
            <div className={styles.walletconnect}>
              <img src={walletconnect} alt='walletconnect' />
            </div>
            <h3>WalletConnect</h3>
            <div>Use a WalletConnect-compatible wallet.</div>
          </div>

          <div
            className={[
              styles.wallet,
              !walletLinkEnabled ? styles.disabled : ''
            ].join(' ')}
            onClick={() => dispatchSetWalletMethod('walletlink')}
          >
            <img src={coinbase} alt='coinbase' />
            <h3>WalletLink</h3>
            <div>Use a Coinbase wallet.</div>
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(WalletPicker);
