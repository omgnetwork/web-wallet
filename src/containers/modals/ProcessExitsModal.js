import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectByzantine } from 'selectors/statusSelector';
import { selectLoading } from 'selectors/loadingSelector';
import { processExits } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import * as styles from './ProcessExitsModal.module.scss';

function ProcessExitsModal ({ exitData, open, toggle }) {
  const dispatch = useDispatch();
  const byzantineChain = useSelector(selectByzantine);
  const loading = useSelector(selectLoading(['QUEUE/PROCESS']));
  const [ maxExits, setMaxExits ] = useState(exitData.queuePosition);

  async function submit () {
    if (maxExits > 0) {
      try {
        await dispatch(processExits(maxExits, exitData.currency));
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Process Exits</h2>

      <Input
        label='Max exits to process'
        placeholder='20'
        type='number'
        value={maxExits || ''}
        onChange={i => setMaxExits(i.target.value)}
      />

      <div className={styles.disclaimer}>
        {`Current exit queue : ${exitData.queueLength || 0}`}
      </div>

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
          disabled={
            maxExits < 1 ||
            exitData.queueLength < 1 ||
            byzantineChain
          }
        >
          PROCESS EXITS
        </Button>
      </div>
    </Modal>
  );
}

export default ProcessExitsModal;
