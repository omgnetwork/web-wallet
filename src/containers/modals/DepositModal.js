import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectLoading } from 'selectors/loadingSelector';
import { deposit } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Tabs from 'components/tabs/Tabs';

import networkService from 'services/networkService';

import * as styles from './DepositModal.module.scss';

function DepositModal ({ open, toggle }) {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading(['DEPOSIT/CREATE']));

  const [ activeTab, setActiveTab ] = useState('ETH');
  const [ value, setValue ] = useState('');
  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  
  async function submit () {
    if (value > 0 && currency) {
      try {
        await dispatch(deposit(value, currency));
        toggle();
      } catch(err) {
        console.warn(err);
      }
    }
  }

  function handleClose () {
    setActiveTab('ETH')
    setValue('')
    setCurrency(networkService.OmgUtil.transaction.ETH_CURRENCY)
    toggle()
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Deposit</h2>

      <Tabs
        onClick={i => {
          i === 'ETH'
            ? setCurrency(networkService.OmgUtil.transaction.ETH_CURRENCY)
            : setCurrency('');
          setActiveTab(i)
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
        unit={activeTab === 'ERC20' ? '' : 'WEI'}
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
          disabled={
            value < 1 ||
            !currency
          }
        >
          DEPOSIT
        </Button>
      </div>
    </Modal>
  );
}

export default DepositModal;
