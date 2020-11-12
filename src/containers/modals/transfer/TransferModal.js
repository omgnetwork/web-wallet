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
import { isEqual } from 'lodash';
import BN from 'bignumber.js';

import { selectChildchainBalance } from 'selectors/balanceSelector';
import { selectLoading } from 'selectors/loadingSelector';
import { selectFees } from 'selectors/feeSelector';
import { selectLedger } from 'selectors/uiSelector';
import { transfer, getTransferTypedData } from 'actions/networkAction';
import { getToken } from 'actions/tokenAction';
import { closeModal, openAlert, setActiveHistoryTab } from 'actions/uiAction';

import LedgerPrompt from 'containers/modals/ledger/LedgerPrompt';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import InputSelect from 'components/inputselect/InputSelect';
import Select from 'components/select/Select';

import networkService from 'services/networkService';
import { logAmount, powAmount } from 'util/amountConvert';

import * as styles from './TransferModal.module.scss';

function TransferModal ({ open }) {
  const dispatch = useDispatch();

  const [ currency, setCurrency ] = useState('');
  const [ value, setValue ] = useState('');
  const [ feeToken, setFeeToken ] = useState('');
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');
  const [ usableFees, setUsableFees ] = useState([]);
  const [ ledgerModal, setLedgerModal ] = useState(false);
  const [ typedData, setTypedData ] = useState({});

  const balances = useSelector(selectChildchainBalance, isEqual);
  const fees = useSelector(selectFees, isEqual);
  const ledgerConnect = useSelector(selectLedger);

  const feesLoading = useSelector(selectLoading([ 'FEE/GET' ]));
  const loading = useSelector(selectLoading([ 'TRANSFER/CREATE' ]));

  useEffect(() => {
    if (Object.keys(fees).length) {
      const usableFees = balances.filter(balance => {
        const feeObject = fees[balance.currency];
        if (feeObject) {
          if (new BN(balance.amount).gte(new BN(feeObject.amount))) {
            return true;
          }
        }
        return false;
      }).map(i => {
        const feeObject = fees[i.currency];
        const feeAmount = new BN(feeObject.amount).div(new BN(feeObject.subunit_to_unit));
        return {
          title: i.name,
          value: i.currency,
          subTitle: `Fee Amount: ${feeAmount.toFixed()}`
        };
      });
      setUsableFees(usableFees);
    }
  }, [ balances, fees, open ]);

  useEffect(() => {
    if (balances.length && !currency) {
      setCurrency(balances[0].currency);
    }
  }, [ balances, currency, open ]);

  useEffect(() => {
    if (usableFees.length && !feeToken) {
      setFeeToken(usableFees[0].value);
    }
  }, [ usableFees, feeToken ]);

  const selectOptions = balances.map(i => ({
    title: i.name,
    value: i.currency,
    subTitle: `Balance: ${logAmount(i.amount, i.decimals)}`
  }));

  async function submit ({ useLedgerSign }) {
    if (
      value > 0 &&
      currency &&
      feeToken &&
      recipient
    ) {
      try {
        const valueTokenInfo = await getToken(currency);
        const { txBody, typedData } = await dispatch(getTransferTypedData({
          recipient,
          value: powAmount(value, valueTokenInfo.decimals),
          currency,
          feeToken,
          metadata
        }));
        setTypedData(typedData);
        const res = await dispatch(transfer({
          useLedgerSign,
          txBody,
          typedData
        }));
        if (res) {
          dispatch(setActiveHistoryTab('Transactions'));
          dispatch(openAlert('Transfer submitted. You will be blocked from making further transactions until the transfer is confirmed.'));
          handleClose();
        }
      } catch (err) {
        //
      }
    }
  }

  function handleClose () {
    setCurrency('');
    setValue('');
    setFeeToken('');
    setRecipient('');
    setMetadata('');
    setLedgerModal(false);
    dispatch(closeModal('transferModal'));
  }

  const disabledTransfer = value <= 0 || !currency || !feeToken || !recipient;

  function renderTransferScreen () {
    return (
      <>
        <h2>Transfer</h2>
        <div className={styles.address}>
          {`From address : ${networkService.account}`}
        </div>

        <Input
          label='To Address'
          placeholder='Hash or ENS name'
          paste
          value={recipient}
          onChange={i => setRecipient(i.target.value)}
        />

        <InputSelect
          label='Amount to transfer'
          placeholder={0}
          value={value}
          onChange={i => setValue(i.target.value)}
          selectOptions={selectOptions}
          onSelect={i => setCurrency(i.target.value)}
          selectValue={currency}
        />

        <Select
          loading={feesLoading}
          label='Fee'
          value={feeToken}
          options={usableFees}
          onSelect={i => setFeeToken(i.target.value)}
          error="No balance to pay fees"
        />

        <Input
          label='Message'
          placeholder='-'
          value={metadata}
          onChange={i => setMetadata(i.target.value || '')}
        />

        <div className={styles.buttons}>
          <Button
            onClick={handleClose}
            type='outline'
            className={styles.button}
          >
            CANCEL
          </Button>

          {ledgerConnect ?
            (
              <Button
                onClick={() => setLedgerModal(true)}
                type='primary'
                className={styles.button}
                loading={loading}
                tooltip='Your transfer transaction is still pending. Please wait for confirmation.'
                disabled={disabledTransfer}
              >
                TRANSFER WITH LEDGER
              </Button>)
            :
            (<Button
              className={styles.button}
              onClick={() => submit({ useLedgerSign: false })}
              type='primary'
              loading={loading}
              tooltip='Your transfer transaction is still pending. Please wait for confirmation.'
              disabled={disabledTransfer}
            >
              TRANSFER
            </Button>)
          }
        </div>
      </>
    );
  }

  return (
    <Modal open={open}>
      {!ledgerModal && renderTransferScreen()}
      {ledgerModal && (
        <LedgerPrompt
          loading={loading}
          submit={submit}
          handleClose={handleClose}
          typedData={typedData}
        />
      )}
    </Modal>
  );
}

export default React.memo(TransferModal);
