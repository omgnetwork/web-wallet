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

import Button from 'components/button/Button';

import { hashTypedDataMessage, getDomainSeperatorHash } from 'services/omgService';

import * as styles from './LedgerPrompt.module.scss';

function LedgerPrompt ({
  loading,
  submit,
  handleClose,
  typedData
}) {
  return (
    <>
      <h2>Ledger Sign</h2>
      <p>Please make sure your Ledger is unlocked, connected and the Ethereum application is open.</p>
      <p>{'This only works on Ledger running firmware version >= 1.5.0-rc2.'}</p>
      {loading && (
        <>
          <p>Please check the Ledger to sign the transaction.</p>
          <p>Check that the domain and message hash match the following:</p>
          {typedData && (
            <>
              <p className={styles.hash}>
                Domain hash: {getDomainSeperatorHash(typedData)}
              </p>
              <p className={styles.hash}>
                Message hash: {hashTypedDataMessage(typedData)}
              </p>
            </>
          )}
        </>
      )}
      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          type='outline'
          className={styles.button}
        >
          CANCEL
        </Button>
        <Button
          className={styles.button}
          onClick={() => submit({ useLedgerSign: true })}
          type='primary'
          loading={loading}
        >
          SIGN
        </Button>
      </div>
    </>
  );
}

export default React.memo(LedgerPrompt);
