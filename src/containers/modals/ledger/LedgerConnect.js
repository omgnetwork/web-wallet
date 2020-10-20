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

import React, { useState } from "react";
import { useDispatch } from 'react-redux';
import { closeModal, openAlert, ledgerConnect } from 'actions/uiAction';

import Button from "components/button/Button";
import Modal from "components/modal/Modal";
import ledger from "images/ledger_connect.png";
import * as styles from "./LedgerConnect.module.scss";

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
        <img src={ledger} className={styles.logo} alt="ledger_logo" />
      </div>

      <div className={styles.title}>Are you connecting with Ledger?</div>

      <div className={styles.buttons}>
        <Button onClick={handleClose} type="outline" className={styles.button}>
          NO
        </Button>
        <Button
          className={styles.button}
          onClick={handleYes}
          type="primary">
          YES
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(LedgerConnect);
