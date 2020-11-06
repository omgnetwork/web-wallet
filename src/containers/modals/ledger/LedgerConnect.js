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

import React from 'react';
import { useDispatch } from 'react-redux';
import { closeModal, ledgerConnect } from 'actions/uiAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';

import ledger from 'images/ledger_connect.png';
import boxarrow from 'images/boxarrow.svg';
import eth from 'images/eth.svg';
import key from 'images/key.svg';
import lock from 'images/lock.svg';

import * as styles from './LedgerConnect.module.scss';

function LedgerConnect ({ submit, open }) {
  const dispatch = useDispatch();

  function handleClose () {
    dispatch(closeModal('ledgerConnectModal'));
  }

  function handleYes () {
    dispatch(ledgerConnect(true));
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

      <div className={styles.buttons}>
        <Button onClick={handleClose} type='outline' className={styles.button}>
          NO
        </Button>
        <Button
          className={styles.button}
          onClick={handleYes}
          type='primary'>
          YES
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(LedgerConnect);