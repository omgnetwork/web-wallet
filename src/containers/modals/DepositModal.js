import React, { useState } from 'react';
import { OmgUtil } from '@omisego/omg-js';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import Tabs from 'components/tabs/Tabs';

import networkService from 'services/networkService';

import * as styles from './DepositModal.module.scss';

function DepositModal ({ open, toggle }) {
  const [ activeTab, setActiveTab ] = useState('ETH');
  const [ loading, setLoading ] = useState(false);
  const [ value, setValue ] = useState(1);
  const [ currency, setCurrency ] = useState(OmgUtil.transaction.ETH_CURRENCY);

  async function submit () {
    if (value && currency) {
      setLoading(true);
      try {
        await networkService.deposit(value, currency);
        setLoading(false);
      } catch (err) {
        console.warn(err);
        handleClose()
      }
    }
  }

  function handleClose () {
    toggle();
    setLoading(false);
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <h2>Deposit</h2>

      <Tabs
        onClick={setActiveTab}
        activeTab={activeTab}
        tabs={[ 'ETH', 'ERC20' ]}
      />

      <Input
        label='ERC20 Address'
        placeholder='0x'
        paste
        value={currency}
        onChange={i => setCurrency(i.target.value)}
      />
      <Input
        label='Amount to deposit into the OMG Network'
        type='number'
        unit='WEI'
        placeholder={0}
        value={currency}
        onChange={i => setValue(i.target.value)}
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
        >
          DEPOSIT
        </Button>
      </div>
    </Modal>
  );
}

export default DepositModal;
