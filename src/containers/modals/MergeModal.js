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
import { orderBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from '@material-ui/icons';

import { selectLoading } from 'selectors/loadingSelector';
import { mergeUtxos } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';

import networkService from 'services/networkService';
import { logAmount } from 'util/amountConvert';

import * as styles from './MergeModal.module.scss';

function MergeModal ({ open, toggle }) {
  const dispatch = useDispatch();
  const [ selectedUTXOs, setSelectedUTXOs ] = useState([]);
  const [ searchUTXO, setSearchUTXO ] = useState('');
  const [ utxos, setUtxos ] = useState([]);

  const loading = useSelector(selectLoading(['TRANSFER/CREATE']));

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

  useEffect(() => {
    if (selectedUTXOs.length) {
      setSearchUTXO(selectedUTXOs[0].currency)
    }
    if (!selectedUTXOs.length) {
      setSearchUTXO('')
    }
  }, [selectedUTXOs])

  async function submit () {
    if (selectedUTXOs.length > 1 && selectedUTXOs.length < 5) {
      try {
        await dispatch(mergeUtxos(selectedUTXOs));
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setSelectedUTXOs([]);
    setSearchUTXO('');
    toggle();
  }

  function handleUtxoClick (utxo) {
    const isSelected = selectedUTXOs.some(i => i.utxo_pos === utxo.utxo_pos);
    if (isSelected) {
      setSelectedUTXOs(selectedUTXOs.filter(i => i.utxo_pos !== utxo.utxo_pos));
    }
    if (!isSelected && selectedUTXOs.length < 4) {
      setSelectedUTXOs([ ...selectedUTXOs, utxo ]);
    }
  }

  const _utxos = utxos
    .filter(i => i.currency.includes(searchUTXO))
    .filter(i => i);
  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Merge UTXO's</h2>
      <div className={styles.disclaimer}>Select the UTXOs you want to merge</div>

      <div className={styles.list}>
        {!utxos.length && (
          <div className={styles.disclaimer}>You do not have any UTXOs on the OMG Network.</div>
        )}
        {_utxos.map((i, index) => {
          const selected = selectedUTXOs.some(selected => selected.utxo_pos === i.utxo_pos)
          return (
            <div
              key={index}
              onClick={() => handleUtxoClick(i)}
              className={[
                styles.utxo,
                selected ? styles.selected : ''
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
                  {selected && <Check />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.disclaimer}>You can select a maximum of 4 UTXOs to merge at once.</div>

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
          disabled={selectedUTXOs.length <= 1 || selectedUTXOs.length > 4}
        >
          MERGE
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(MergeModal);
