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
import { transfer } from 'actions/networkAction';
import { getToken } from 'actions/tokenAction';
import { closeModal } from 'actions/uiAction';

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
  const balances = useSelector(selectChildchainBalance, isEqual);

  const [ currency, setCurrency ] = useState('');
  const [ value, setValue ] = useState('');
  const [ feeToken, setFeeToken ] = useState('');
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');
  const [ usableFees, setUsableFees ] = useState([]);

  const fees = useSelector(selectFees);
  const feesLoading = useSelector(selectLoading(['FEES/GET']));
  const loading = useSelector(selectLoading(['TRANSFER/CREATE']));

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
        }
      });
      if (usableFees.length) {
        setUsableFees(usableFees);
      }
    }
  }, [balances, fees]);

  useEffect(() => {
    if (balances.length && !currency) {
      setCurrency(balances[0].currency)
    }
  }, [balances, currency])

  useEffect(() => {
    if (usableFees.length && !feeToken) {
      setFeeToken(usableFees[0].value)
    }
  }, [usableFees, feeToken])

  const selectOptions = balances.map(i => ({
    title: i.name,
    value: i.currency,
    subTitle: `Balance: ${logAmount(i.amount, i.decimals)}`
  }));

  async function submit () {
    if (
      value > 0 &&
      currency &&
      feeToken &&
      networkService.web3.utils.isAddress(recipient)
    ) {
      const valueTokenInfo = await getToken(currency);
      try {
        await dispatch(transfer({
          recipient,
          value: powAmount(value, valueTokenInfo.decimals),
          currency,
          feeToken,
          metadata
        }))
        handleClose();
      } catch (err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setCurrency('');
    setValue('');
    setFeeToken('');
    setRecipient('');
    setMetadata('');
    dispatch(closeModal('transferModal'));
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Transfer</h2>

      <div className={styles.address}>
        {`From address : ${networkService.account}`}
      </div>

      <Input
        label='To Address'
        placeholder='0x'
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
        label='Fee Token'
        value={feeToken}
        options={usableFees}
        onSelect={i => setFeeToken(i.target.value)}
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
            value <= 0 ||
            !currency ||
            !feeToken ||
            !recipient ||
            !metadata ||
            !networkService.web3.utils.isAddress(recipient)
          }
        >
          TRANSFER
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(TransferModal);
