import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import { Check } from '@material-ui/icons';

import { selectPendingExits } from 'selectors/exitSelector';
import { selectLoading } from 'selectors/loadingSelector';
import { exitUtxo } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import networkService from 'services/networkService';

import * as styles from './ExitModal.module.scss';

function ExitModal ({ open, toggle }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading(['EXIT/CREATE']));
  const pendingExits = useSelector(selectPendingExits);
  const isPending = pendingExits.some(i => i.status === 'Pending');

  const [ selectedUTXO, setSelectedUTXO ] = useState();
  const [ searchUTXO, setSearchUTXO ] = useState('');
  const [ utxos, setUtxos ] = useState([]);

  useEffect(() => {
    async function fetchUTXOS () {
      const utxos = await networkService.getUtxos();
      setUtxos(utxos);
    }
    if (open) {
      fetchUTXOS();
    }
  }, [open]);

  async function submit () {
    if (selectedUTXO) {
      try {
        await dispatch(exitUtxo(selectedUTXO));
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setSelectedUTXO();
    setSearchUTXO('');
    toggle();
  }

  const _utxos = utxos.filter(i => i.currency.includes(searchUTXO));
  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Start Standard Exit</h2>

      <Input
        label='Select a UTXO to exit from the OMG Network'
        icon
        placeholder='Search by token'
        value={searchUTXO}
        onChange={i => setSearchUTXO(i.target.value)}
      />

      <div className={styles.list}>
        {!utxos.length && (
          <div className={styles.disclaimer}>You do not have any UTXOs on the OMG Network.</div>
        )}
        {_utxos.map((i, index) => {
          return (
            <div
              key={index}
              onClick={() => setSelectedUTXO(i)}
              className={[
                styles.utxo,
                selectedUTXO === i ? styles.selected : ''
              ].join(' ')}
            >
              <div className={styles.title}>
                {truncate(i.currency, 10, 4, '...')}
              </div>

              <div className={styles.value}>
                <div className={styles.amount}>
                  {`Amount: ${i.amount.toString()}`}
                </div>

                <div className={styles.check}>
                  {selectedUTXO === i && <Check />}
                </div>
              </div>
            </div>
          );
        })}
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
          loading={loading || isPending}
          disabled={!selectedUTXO}
        >
          SUBMIT EXIT
        </Button>
      </div>
    </Modal>
  );
}

export default ExitModal;
