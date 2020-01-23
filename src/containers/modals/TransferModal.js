import React, { useState } from 'react';

import Alert from 'components/alert/Alert';
import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import InputSelect from 'components/inputselect/InputSelect';

import networkService from 'services/networkService';

import * as styles from './TransferModal.module.scss';

function TransferModal ({ open, toggle, balances = [] }) {
  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ value, setValue ] = useState(0);
  const [ feeToken, setFeeToken ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ feeValue, setFeeValue ] = useState(0);
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');

  const [ errorOpen, setErrorOpen ] = useState(false);
  const [ loading, setLoading ] = useState(false);

  const selectOptions = balances.map(i => ({
    title: i.symbol,
    value: i.token,
    subTitle: `Balance: ${i.amount}`
  }))

  async function submit () {
    if (
      value > 0 &&
      feeValue > 0 &&
      currency &&
      feeToken &&
      recipient
    ) {
      setLoading(true);
      try {
        const receipt = await networkService.transfer({
          recipient,
          value,
          currency,
          feeValue,
          feeToken,
          metadata
        });
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
    setCurrency(networkService.OmgUtil.transaction.ETH_CURRENCY);
    setValue(0);
    setFeeToken(networkService.OmgUtil.transaction.ETH_CURRENCY);
    setFeeValue(0);
    setRecipient('');
    setMetadata('');
    setLoading(false);
    toggle();
  }

  return (
    <Modal open={open} onClose={handleClose}>
      <Alert type='error' duration={null} open={!!errorOpen} onClose={() => setErrorOpen(false)}>
        {`Oops! Something went wrong! ${errorOpen}`}
      </Alert>

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

      <InputSelect
        label='Fee'
        placeholder={0}
        value={feeValue}
        onChange={i => setFeeValue(i.target.value)}
        selectOptions={selectOptions}
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
