import React, { useState, useEffect } from 'react';
import { orderBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from '@material-ui/icons';

import { selectLoading } from 'selectors/loadingSelector';
import { exitUtxo } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import networkService from 'services/networkService';
import { logAmount } from 'util/amountConvert';

import * as styles from './ExitModal.module.scss';

function ExitModal ({ open, toggle }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading(['EXIT/CREATE']));

  const [ selectedUTXO, setSelectedUTXO ] = useState();
  const [ searchUTXO, setSearchUTXO ] = useState('');
  const [ utxos, setUtxos ] = useState([]);

  useEffect(() => {
    async function fetchUTXOS () {
      const _utxos = await networkService.getUtxos();
      const utxos = orderBy(_utxos, i => i.currency, 'desc');
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

  
  const _utxos = utxos
    .filter(i => {
      return i.currency.toLowerCase().includes(searchUTXO.toLowerCase()) ||
        i.tokenInfo.name.toLowerCase().includes(searchUTXO.toLowerCase())
    })
    .filter(i => !!i);
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
                {i.tokenInfo.name}
              </div>

              <div className={styles.value}>
                <div className={styles.amount}>
                  {logAmount(i.amount.toString(), i.tokenInfo.decimals)}
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
          loading={loading}
          disabled={!selectedUTXO}
        >
          SUBMIT EXIT
        </Button>
      </div>
    </Modal>
  );
}

export default ExitModal;
