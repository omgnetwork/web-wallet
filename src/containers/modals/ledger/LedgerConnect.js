/* eslint-disable quotes */
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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { closeModal, ledgerConnect } from 'actions/uiAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Select from 'components/select/Select';

import ledger from 'images/ledger_connect.png';
import boxarrow from 'images/boxarrow.svg';
import eth from 'images/eth.svg';
import key from 'images/key.svg';
import lock from 'images/lock.svg';

import { openError } from 'actions/uiAction';
import networkService from 'services/networkService';

import * as styles from './LedgerConnect.module.scss';

const derivationOptions = {
  0: "44'/60'/0'/0/0",
  1: "44'/60'/1'/0/0",
  2: "44'/60'/2'/0/0",
  3: "44'/60'/3'/0/0",
  4: "44'/60'/4'/0/0",
  5: "44'/60'/5'/0/0",
  6: "44'/60'/6'/0/0",
  7: "44'/60'/7'/0/0",
  8: "44'/60'/8'/0/0",
  9: "44'/60'/9'/0/0",
  10: "44'/60'/10'/0/0"
};

function LedgerConnect ({ submit, open }) {
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ derivation, setDerivation ] = useState(derivationOptions[0]);

  function handleClose () {
    dispatch(closeModal('ledgerConnectModal'));
  }

  async function handleYes () {
    setLoading(true);
    const ledgerConfig = await networkService.getLedgerConfiguration(derivation);
    setLoading(false);

    if (!ledgerConfig.connected) {
      return dispatch(openError('Could not connect to the Ledger. Please check that your Ledger is unlocked and the Ethereum application is open.'));
    }
    if (!ledgerConfig.addressMatch) {
      return dispatch(openError('Your Web3 provider is not connected to your Ledger address. Please make sure your Web3 provider is pointing to the correct Ledger address.'));
    }

    // check eth app is greater than or equal to 1.4.0
    const version = ledgerConfig.version.split('.').map(Number);
    if (
      version[0] < 1 ||
      (version[0] === 1 && version[1] < 4)
    ) {
      return dispatch(openError(`Ethereum application version ${ledgerConfig.version} is unsupported. Please install version 1.4.0 or greater on your device.`));
    }

    if (!ledgerConfig.dataEnabled) {
      return dispatch(openError('Contract Data is not configured correctly. Please follow the steps outlined to allow Contract Data.'));
    }

    dispatch(ledgerConnect(derivation));
    dispatch(closeModal('ledgerConnectModal'));
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className={styles.logoContainer}>
        <img src={ledger} className={styles.logo} alt='ledger_logo' />
      </div>

      <div className={styles.title}>Are you connecting with Ledger?</div>
      <div className={styles.description}>If so, please check the following steps to make sure Contract Data is allowed in your Ledger&apos;s Ethereum application settings.</div>

      <div className={styles.steps}>
        <div className={styles.step}>
          <div className={styles.iconWrapper}>
            <img src={lock} alt='lock' />
          </div>
          <div className={styles.text}>1. Connect and unlock your Ledger device.</div>
        </div>
        <div className={styles.step}>
          <div className={styles.iconWrapper}>
            <img src={eth} alt='eth' />
          </div>
          <div className={styles.text}>2. Open the Ethereum application.</div>
        </div>
        <div className={styles.step}>
          <div className={styles.iconWrapper}>
            <img src={boxarrow} alt='boxarrow' />
          </div>
          <div className={styles.text}>3. Press the right button to navigate to Settings. Then press both buttons to validate.</div>
        </div>
        <div className={styles.step}>
          <div className={styles.iconWrapper}>
            <img src={key} alt='key' />
          </div>
          <div className={styles.text}>4. In the Contract data settings, press both buttons to allow contract data in transactions. The device displays Allowed.</div>
        </div>
      </div>

      <Select
        label='Derivation Path'
        value={derivation}
        options={Object.values(derivationOptions).map(i => ({ title: i, value: i }))}
        onSelect={i => setDerivation(i.target.value)}
      />

      <div className={styles.buttons}>
        <Button onClick={handleClose} type='outline' className={styles.button}>
          NO
        </Button>
        <Button
          className={styles.button}
          onClick={handleYes}
          type='primary'
          loading={loading}
        >
          YES
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(LedgerConnect);
