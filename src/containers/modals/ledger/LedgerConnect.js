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

import React, { useState, useEffect } from 'react';
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

const steps = {
  usingLedger: 'USING_LEDGER',
  selectAddress: 'SELECT_ADDRESS'
};

function LedgerConnect ({ submit, open }) {
  const dispatch = useDispatch();
  const [ loading, setLoading ] = useState(false);
  const [ derivationMapLoading, setDerivationMapLoading ] = useState(false);

  const [ derivationMap, setDerivationMap ] = useState({});
  const [ step, setStep ] = useState(steps.usingLedger);

  const [ selectedAddress, setSelectedAddress ] = useState('');
  const [ selectedPath, setSelectedPath ] = useState('');

  useEffect(() => {
    async function fetchAddresses () {
      setDerivationMapLoading(true);
      try {
        const derivationMap = await networkService.getLedgerAddresses();
        setDerivationMap(derivationMap);
        setSelectedAddress(Object.values(derivationMap)[0]);
        setSelectedPath(Object.keys(derivationMap)[0]);
        setDerivationMapLoading(false);
      } catch (error) {
        setStep(steps.usingLedger);
      }
    }

    if (step === steps.selectAddress) {
      fetchAddresses();
    }
  }, [ step ]);

  function handleClose () {
    dispatch(closeModal('ledgerConnectModal'));
  }

  async function handleAddessConfirm () {
    if (networkService.account.toLowerCase() !== selectedAddress.toLowerCase() ) {
      return dispatch(openError('Your Web3 provider is not pointing to your Ledger address. Please make sure your Web3 provider is pointing to the selected Ledger address.'));
    }
    dispatch(ledgerConnect(selectedPath));
    dispatch(closeModal('ledgerConnectModal'));
  }

  async function handleYes () {
    setLoading(true);
    const ledgerConfig = await networkService.getLedgerConfiguration();
    setLoading(false);

    if (!ledgerConfig.connected) {
      return dispatch(openError('Could not connect to the Ledger. Please check that your Ledger is unlocked and the Ethereum application is open.'));
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

    return setStep(steps.selectAddress);
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <div className={styles.logoContainer}>
        <img src={ledger} className={styles.logo} alt='ledger_logo' />
      </div>

      {step === steps.usingLedger && (
        <>
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
        </>
      )}

      {step === steps.selectAddress && (
        <>
          <div className={styles.title}>Select Address</div>
          <div className={styles.description}>Select the address you will use with the Ledger. Make sure your Web3 provider is pointing to the same address selected.</div>

          {derivationMapLoading && (
            <p>Fetching Ledger Addresses...</p>
          )}
          {!derivationMapLoading && (
            <Select
              label='Address'
              value={selectedPath}
              options={Object.keys(derivationMap).map(i => ({ title: derivationMap[i], subTitle: i, value: i }))}
              onSelect={i => {
                setSelectedPath(i.target.value);
                setSelectedAddress(derivationMap[i.target.value]);
              }}
            />
          )}
        </>
      )}
    </Modal>
  );
}

export default React.memo(LedgerConnect);
