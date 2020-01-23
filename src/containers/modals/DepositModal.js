import React, { useState } from 'react';

import Alert from 'components/alert/Alert';
import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Tabs from 'components/tabs/Tabs';

import networkService from 'services/networkService';

import * as styles from './DepositModal.module.scss';

function DepositModal ({ open, toggle }) {
  const [ activeTab, setActiveTab ] = useState('ETH');
  const [ value, setValue ] = useState('');
  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  
  const [ loading, setLoading ] = useState(false);
  const [ errorOpen, setErrorOpen ] = useState(false);

  async function submit () {
    if (value > 0 && currency) {
      setLoading(true);
      try {
        const receipt = await networkService.deposit(value, currency);
        console.log(receipt);
        handleClose();
      } catch (err) {
        console.warn(err);
        setLoading(false);
        setErrorOpen(err.message);
      }
    }
  }

  function handleClose () {
    toggle();
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Alert type='error' duration={null} open={!!errorOpen} onClose={() => setErrorOpen(false)}>
        {`Oops! Something went wrong! ${errorOpen}`}
      </Alert>

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
          disabled={!value || !currency}
        >
          DEPOSIT
        </Button>
      </div>
    </Modal>
  );
}

export default DepositModal;
