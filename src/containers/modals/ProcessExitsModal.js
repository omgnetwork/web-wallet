import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectLoading } from 'selectors/loadingSelector';
import { selectQueue } from 'selectors/queueSelector';
import { processExits, getExitQueue } from 'actions/networkAction';
import networkService from 'services/networkService';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import * as styles from './ProcessExitsModal.module.scss';

function ProcessExitsModal ({ open, toggle, utxo }) {
  const dispatch = useDispatch();

  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);  
  const [ maxExits, setMaxExits ] = useState(20);

  const loading = useSelector(selectLoading(['EXIT/PROCESS']));
  const queue = useSelector(selectQueue(currency));

  useEffect(() => {
    if (currency && networkService.web3.utils.isAddress(currency)) {
      dispatch(getExitQueue(currency));
    }
  }, [currency, dispatch]);

  async function submit () {
    if (maxExits > 0) {
      try {
        await dispatch(processExits(maxExits, currency));
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setCurrency(networkService.OmgUtil.transaction.ETH_CURRENCY);
    setMaxExits(queue);
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Process Exits</h2>

      <Input
        label='Currency'
        placeholder='0x'
        paste
        value={currency}
        onChange={i => setCurrency(i.target.value)}
      />

      <Input
        label='Max exits to process'
        placeholder='20'
        type='number'
        value={maxExits}
        onChange={i => setMaxExits(i.target.value)}
      />

      <div className={styles.disclaimer}>
        {`Current exit queue : ${queue ? queue : 0}`}
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
          disabled={!maxExits > 0 || !currency || !networkService.web3.utils.isAddress(currency)}
        >
          PROCESS EXITS
        </Button>
      </div>
    </Modal>
  );
}

export default ProcessExitsModal;
