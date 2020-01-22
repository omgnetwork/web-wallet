import React, { useState } from 'react';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import InputSelect from 'components/inputselect/InputSelect';

import networkService from 'services/networkService';

import * as styles from './TransferModal.module.scss';

function TransferModal ({ open, toggle }) {
  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ value, setValue ] = useState(0);
  const [ feeToken, setFeeToken ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ feeValue, setFeeValue ] = useState(0);
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');
  
  const [ loading, setLoading ] = useState(false);
  const [ success, setSuccess ] = useState(false);

  async function submit () {
    if (
      value &&
      feeValue &&
      currency &&
      feeToken &&
      recipient
    ) {
      setLoading(true);
      try {
        await networkService.transfer({
          recipient,
          value,
          currency,
          feeValue,
          feeToken,
          metadata
        });
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        console.warn(err);
        handleClose()
      }
    }
  }

  function handleClose () {
    toggle();
    setSuccess(false);
    setLoading(false);
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
        selectOptions={[
          { title: 'ETH', value: networkService.OmgUtil.transaction.ETH_CURRENCY, subTitle: `Balance: ${'134019'}` },
          { title: 'WETH', value: '0xc341', subTitle: `Balance: ${'1515159'}` },
        ]}
        onSelect={i => setCurrency(i.target.value)}
        selectValue={currency}
      />

      <InputSelect
        label='Fee'
        placeholder={0}
        value={feeValue}
        onChange={i => setFeeValue(i.target.value)}
        selectOptions={[
          { title: 'ETH', value: networkService.OmgUtil.transaction.ETH_CURRENCY, subTitle: `Balance: ${'134019'}` },
          { title: 'WETH', value: '0xc341', subTitle: `Balance: ${'1515159'}` },
        ]}
        onSelect={i => setFeeToken(i.target.value)}
        selectValue={feeToken}
      />

      <Input
        label='Metadata'
        placeholder='-'
        value={metadata}
        onChange={i => setMetadata(i.target.value)}
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
            !value ||
            !feeValue ||
            !currency ||
            !feeToken ||
            !recipient
          }
        >
          TRANSFER
        </Button>
      </div>
    </Modal>
  );
}

export default TransferModal;
