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

import React, { useState, useEffect, useMemo } from 'react';
import { orderBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from '@material-ui/icons';

import { selectLoading } from 'selectors/loadingSelector';
import { exitUtxo } from 'actions/networkAction';
import { closeModal } from 'actions/uiAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';

import networkService from 'services/networkService';
import { logAmount } from 'util/amountConvert';

import * as styles from './ExitModal.module.scss';

function ExitModal ({ open }) {
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
    dispatch(closeModal('exitModal'));
  }

  const _utxos = useMemo(() => {
    return utxos.filter(i => {
      return i.currency.toLowerCase().includes(searchUTXO.toLowerCase()) ||
        i.tokenInfo.name.toLowerCase().includes(searchUTXO.toLowerCase())
      })
      .filter(i => !!i);
  }, [ utxos, searchUTXO ]);

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

export default React.memo(ExitModal);
