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
import { useDispatch, useSelector } from 'react-redux';
import numbro from 'numbro';

import { selectByzantine } from 'selectors/statusSelector';
import { selectLoading } from 'selectors/loadingSelector';
import { processExits } from 'actions/networkAction';

import GasPicker from 'components/gaspicker/GasPicker';
import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import * as styles from './ProcessExitsModal.module.scss';

function ProcessExitsModal ({ exitData, open, toggle }) {
  const dispatch = useDispatch();

  const byzantineChain = useSelector(selectByzantine);
  const loading = useSelector(selectLoading([ 'QUEUE/PROCESS' ]));
  
  const [ maxExits, setMaxExits ] = useState('');
  const [ gasPrice, setGasPrice ] = useState();
  const [ selectedSpeed, setSelectedSpeed ] = useState('normal');

  useEffect(() => {
    if (exitData) {
      setMaxExits(exitData.queuePosition);
    }
  }, [ exitData, open ]);

  async function submit () {
    if (maxExits > 0) {
      const res = await dispatch(processExits(maxExits, exitData.currency, gasPrice));
      if (res) {
        handleClose();
      }
    }
  }

  function handleClose () {
    setSelectedSpeed('normal');
    setMaxExits('');
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Process Exit</h2>

      <div className={styles.note}>
        <span>This exit is currently</span>
        <span className={styles.position}>{exitData ? numbro(exitData.queuePosition).format({ output: 'ordinal' }) : ''}</span>
        <span>{`in the queue for this token. You will need to process ${exitData.queuePosition} ${exitData.queuePosition === 1 ? 'exit' : 'exits'} to release your funds.`}</span>
      </div>

      <Input
        label='How many exits would you like to process?'
        placeholder='20'
        type='number'
        value={maxExits}
        onChange={i => {
          i.target.value <= exitData.queueLength
            ? setMaxExits(i.target.value)
            : setMaxExits(exitData.queueLength);
        }}
      />

      <div className={styles.disclaimer}>
        {`Current exit queue length: ${exitData.queueLength || 0}`}
      </div>

      <GasPicker
        selectedSpeed={selectedSpeed}
        setSelectedSpeed={setSelectedSpeed}
        setGasPrice={setGasPrice}
      />

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          type='outline'
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={submit}
          type='primary'
          style={{ flex: 0 }}
          loading={loading}
          tooltip='Your process exits transaction is still pending. Please wait for confirmation.'
          disabled={
            maxExits < 1 ||
            exitData.queueLength < 1 ||
            byzantineChain
          }
        >
          PROCESS
        </Button>
      </div>
    </Modal>
  );
}

export default ProcessExitsModal;
