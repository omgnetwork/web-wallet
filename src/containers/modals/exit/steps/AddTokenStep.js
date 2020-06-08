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

import { selectLoading } from 'selectors/loadingSelector';
import { addExitQueue } from 'actions/networkAction';

import Button from 'components/button/Button';

import * as styles from '../ExitModal.module.scss';

function AddTokenStep ({
  selectedUTXO,
  setSelectedUTXO,
  setStep,
  gasPrice
}) {
  const dispatch = useDispatch();

  const addExitQueueLoading = useSelector(selectLoading([ 'QUEUE/CREATE' ]));

  async function doAddExitQueue () {
    const res = await dispatch(addExitQueue(selectedUTXO.currency, gasPrice));
    if (res) {
      return setStep(3);
    }
  }

  function handleBackClick () {
    setSelectedUTXO();
    setStep(1);
  }

  return (
    <>
      <h2>Add Exit Queue</h2>

      <div>{`The exit queue for ${selectedUTXO.tokenInfo.name} does not exist yet. Adding the exit queue is required before being able to start your exit.`}</div>

      <div className={styles.buttons}>
        <Button
          onClick={handleBackClick}
          type='outline'
          style={{ flex: 0 }}
        >
          GO BACK
        </Button>
        <Button
          onClick={doAddExitQueue}
          type='primary'
          style={{ flex: 0 }}
          loading={addExitQueueLoading}
          tooltip='Your add exit queue transaction is still pending. Please wait for confirmation.'
        >
          ADD QUEUE
        </Button>
      </div>
    </>
  );
}

export default React.memo(AddTokenStep);
