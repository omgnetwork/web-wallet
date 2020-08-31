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

import React, { useState, useMemo, useEffect } from 'react';
import { orderBy } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { Check } from '@material-ui/icons';

import networkService from 'services/networkService';
import { openAlert } from 'actions/uiAction';
import { checkForExitQueue, exitUtxo } from 'actions/networkAction';
import { selectLoading } from 'selectors/loadingSelector';

import GasPicker from 'components/gaspicker/GasPicker';
import Input from 'components/input/Input';
import Button from 'components/button/Button';

import { logAmount } from 'util/amountConvert';

import * as styles from '../ExitModal.module.scss';

function SelectStep ({
  setSelectedUTXO,
  selectedUTXO,
  handleClose,
  setStep,
  gasPrice,
  setGasPrice,
  selectedSpeed,
  setSelectedSpeed
}) {
  const dispatch = useDispatch();

  const [ utxos, setUtxos ] = useState([]);
  const [ searchUTXO, setSearchUTXO ] = useState('');

  const submitLoading = useSelector(selectLoading([
    `QUEUE/GET_${selectedUTXO ? selectedUTXO.currency : ''}`,
    'EXIT/CREATE'
  ]));

  useEffect(() => {
    async function fetchUTXOS () {
      const _utxos = await networkService.getUtxos();
      const utxos = orderBy(_utxos, i => i.currency, 'desc');
      setUtxos(utxos);
    }
    fetchUTXOS();
  }, []);

  async function doCheckExitQueue () {
    const res = await dispatch(checkForExitQueue(selectedUTXO.currency));
    if (!res) {
      return setStep(2);
    }
    return doExit();
  }

  async function doExit () {
    const res = await dispatch(exitUtxo(selectedUTXO, gasPrice));
    if (res) {
      dispatch(openAlert('Exit submitted. You will be blocked from making further transactions until the exit is confirmed.'));
      handleClose();
    }
  }

  const _utxos = useMemo(() => {
    return utxos.filter(i => {
      return i.currency.toLowerCase().includes(searchUTXO.toLowerCase()) ||
        i.tokenInfo.name.toLowerCase().includes(searchUTXO.toLowerCase());
    }).filter(i => !!i);
  }, [ utxos, searchUTXO ]);

  function closeModal () {
    setSearchUTXO('');
    setSelectedSpeed('normal');
    handleClose();
  }

  return (
    <>
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

      <GasPicker
        selectedSpeed={selectedSpeed}
        setSelectedSpeed={setSelectedSpeed}
        setGasPrice={setGasPrice}
      />

      <div className={styles.buttons}>
        <Button
          onClick={closeModal}
          type='outline'
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        <Button
          onClick={doCheckExitQueue}
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

export default React.memo(SelectStep);
