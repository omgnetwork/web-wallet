import React, { useState, useEffect } from 'react';
import truncate from 'truncate-middle';

import Alert from 'components/alert/Alert';
import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import networkService from 'services/networkService';

import * as styles from './ProcessExitsModal.module.scss';

function ProcessExitsModal ({ open, toggle, utxo }) {
  const [ maxExits, setMaxExits ] = useState();
  const [ queueLength, setQueueLength ] = useState();

  const [ errorOpen, setErrorOpen ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  // useEffect(() => {
  //   async function fetchExitQueue () {
  //     const queue = await networkService.getExitQueue();
  //     setQueueLength(queue.length);
  //   }
  //   if (open) {
  //     fetchExitQueue();
  //   }
  // }, [open]);

  async function submit () {
    if (maxExits) {
      setLoading(true);
      try {
        // await networkService.processExits(maxExits);
        handleClose();
      } catch (err) {
        console.warn(err);
        setLoading(false);
        setErrorOpen(err.message);
      }
    }
  }

  function handleClose () {
    setLoading(false);
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Alert type='error' duration={null} open={!!errorOpen} onClose={() => setErrorOpen(false)}>
        {`Oops! Something went wrong! ${errorOpen}`}
      </Alert>

      <h2>Process Exits</h2>

      <Input
        label='Max exits to process'
        placeholder='20'
        type='number'
        value={maxExits}
        onChange={i => setMaxExits(i.target.value)}
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
          disabled={!maxExits}
        >
          PROCESS EXITS
        </Button>
      </div>
    </Modal>
  );
}

export default ProcessExitsModal;
