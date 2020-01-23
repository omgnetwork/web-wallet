import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { selectLoading } from 'selectors/loadingSelector';
import { transfer } from 'actions/networkAction';

import Button from 'components/button/Button';
import Modal from 'components/modal/Modal';
import Input from 'components/input/Input';
import InputSelect from 'components/inputselect/InputSelect';

import networkService from 'services/networkService';

import * as styles from './TransferModal.module.scss';

function TransferModal ({ open, toggle, balances = [] }) {
  const dispatch = useDispatch();
  const [ currency, setCurrency ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ value, setValue ] = useState('');
  const [ feeToken, setFeeToken ] = useState(networkService.OmgUtil.transaction.ETH_CURRENCY);
  const [ feeValue, setFeeValue ] = useState('');
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');

  const loading = useSelector(selectLoading(['TRANSFER/CREATE']));

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
      networkService.web3.utils.isAddress(recipient)
    ) {
      try {
        await dispatch(transfer({
          recipient,
          value,
          currency,
          feeValue,
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
    setCurrency(networkService.OmgUtil.transaction.ETH_CURRENCY);
    setValue('');
    setFeeToken(networkService.OmgUtil.transaction.ETH_CURRENCY);
    setFeeValue('');
    setRecipient('');
    setMetadata('');
    toggle();
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
            !recipient ||
            !networkService.web3.utils.isAddress(recipient)
          }
        >
          TRANSFER
        </Button>
      </div>
    </Modal>
  );
}

export default TransferModal;
