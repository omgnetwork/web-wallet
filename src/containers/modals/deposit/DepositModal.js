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

import { selectLoading } from 'selectors/loadingSelector';
import { deposit } from 'actions/networkAction';
import { closeModal, openAlert } from 'actions/uiAction';
import { getToken } from 'actions/tokenAction';
import { powAmount } from 'util/amountConvert';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Tabs from 'components/tabs/Tabs';

import networkService from 'services/networkService';

import * as styles from './DepositModal.module.scss';

const ETH = networkService.OmgUtil.transaction.ETH_CURRENCY;

function DepositModal ({ open }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading(['DEPOSIT/CREATE']));

  const [ activeTab, setActiveTab ] = useState('ETH');
  const [ value, setValue ] = useState('');
  const [ currency, setCurrency ] = useState(ETH);
  const [ tokenInfo, setTokenInfo ] = useState({});

  useEffect(() => {
    async function getTokenInfo () {
      if (currency && networkService.web3.utils.isAddress(currency)) {
        const tokenInfo = await getToken(currency);
        setTokenInfo(tokenInfo);
      } else {
        setTokenInfo({});
      }
    }
    getTokenInfo();
  }, [currency]);
  
  async function submit () {
    if (value > 0 && currency && tokenInfo) {
      const amount = powAmount(value, tokenInfo.decimals);
      const res = await dispatch(deposit(amount, currency));
      if (res) {
        dispatch(openAlert('Deposit submitted. Check the Deposits tab to see the status of your deposit.'));
        handleClose();
      }
    }
  }

  function handleClose () {
    setActiveTab('ETH');
    setValue('');
    setCurrency(ETH);
    dispatch(closeModal('depositModal'));
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Deposit</h2>

      <Tabs
        className={styles.tabs}
        onClick={i => {
          i === 'ETH' ? setCurrency(ETH) : setCurrency('');
          setActiveTab(i);
        }}
        activeTab={activeTab}
        tabs={[ 'ETH', 'ERC20' ]}
      />

      {activeTab === 'ERC20' && (
        <Input
          label='ERC20 Address'
          placeholder='0x'
          paste
          value={currency}
          onChange={i => setCurrency(i.target.value)}
        />
      )}

      <Input
        label='Amount to deposit into the OMG Network'
        type='number'
        unit={tokenInfo ? tokenInfo.name : ''}
        placeholder={0}
        value={value}
        onChange={i => setValue(i.target.value)}
      />

      {activeTab === 'ERC20' && (
        <div className={styles.disclaimer}>*You will be prompted with 2 confirmations. The first to approve the deposit amount and the second being the actual deposit transaction.</div>
      )}

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
          tooltip='Your deposit transaction is still pending. Please wait for confirmation.'
          disabled={
            value <= 0 ||
            !currency ||
            !networkService.web3.utils.isAddress(currency)
          }
        >
          DEPOSIT
        </Button>
      </div>
    </Modal>
  );
}

export default React.memo(DepositModal);
