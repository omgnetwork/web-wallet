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
import { useDispatch, useSelector } from 'react-redux';

import { exitUtxo } from 'actions/networkAction';
import { openAlert } from 'actions/uiAction';
import { selectLoading } from 'selectors/loadingSelector';

import Button from 'components/button/Button';

import * as styles from '../ExitModal.module.scss';

function DoExitStep ({
  selectedUTXO,
  handleClose,
  gasPrice
}) {
  const dispatch = useDispatch();

  const submitLoading = useSelector(selectLoading([ 'EXIT/CREATE' ]));

  async function doExit () {
    const res = await dispatch(exitUtxo(selectedUTXO, gasPrice));
    if (res) {
      dispatch(openAlert('Exit submitted. You will be blocked from making further transactions until the exit is confirmed.'));
      handleClose();
    }
  }

  return (
    <>
      <h2>Start Standard Exit</h2>

      <div>{'The exit queue has been added. You can now start your exit.'}</div>

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          type='outline'
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={doExit}
          type='primary'
          style={{ flex: 0 }}
          loading={submitLoading}
          tooltip='Your exit transaction is still pending. Please wait for confirmation.'
          disabled={!selectedUTXO}
        >
          SUBMIT EXIT
        </Button>
      </div>
    </>
  );
}

export default React.memo(DoExitStep);
