import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import GasPicker from 'components/gaspicker/GasPicker';
import Button from 'components/button/Button';
import Input from 'components/input/Input';
import Tabs from 'components/tabs/Tabs';

import { depositEth } from 'actions/networkAction';
import { openAlert, setActiveHistoryTab } from 'actions/uiAction';
import { powAmount } from 'util/amountConvert';
import networkService from 'services/networkService';
import { selectLoading } from 'selectors/loadingSelector';

import * as styles from '../DepositModal.module.scss';

const ETH = networkService.OmgUtil.transaction.ETH_CURRENCY;

function InputStep ({
  onClose,
  onNext,
  currency,
  tokenInfo,
  value,
  setCurrency,
  setTokenInfo,
  setValue
}) {
  const dispatch = useDispatch();
  const [ activeTab, setActiveTab ] = useState('ETH');
  const depositLoading = useSelector(selectLoading([ 'DEPOSIT/CREATE' ]));
  const [ selectedSpeed, setSelectedSpeed ] = useState('normal');
  const [ gasPrice, setGasPrice ] = useState();

  function handleClose () {
    setActiveTab('ETH');
    onClose();
  }

  async function depositETH () {
    if (value > 0 && tokenInfo) {
      const amount = powAmount(value, tokenInfo.decimals);
      const res = await dispatch(depositEth(amount, gasPrice));
      if (res) {
        dispatch(setActiveHistoryTab('Deposits'));
        dispatch(openAlert('ETH deposit submitted.'));
        handleClose();
      }
    }
  }

  const disabledSubmit = value <= 0 || !currency || !networkService.web3.utils.isAddress(currency);

  return (
    <>
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

      {activeTab === 'ETH' && (
        <GasPicker
          selectedSpeed={selectedSpeed}
          setSelectedSpeed={setSelectedSpeed}
          setGasPrice={setGasPrice}
        />
      )}

      <div className={styles.buttons}>
        <Button
          onClick={handleClose}
          type='outline'
          style={{ flex: 0 }}
        >
          CANCEL
        </Button>
        {activeTab === 'ETH' && (
          <Button
            onClick={depositETH}
            type='primary'
            style={{ flex: 0 }}
            loading={depositLoading}
            tooltip='Your deposit transaction is still pending. Please wait for confirmation.'
            disabled={disabledSubmit}
          >
            DEPOSIT
          </Button>
        )}
        {activeTab === 'ERC20' && (
          <Button
            onClick={onNext}
            type='primary'
            style={{ flex: 0 }}
            disabled={disabledSubmit}
          >
            NEXT
          </Button>
        )}
      </div>
    </>
  );
}

export default React.memo(InputStep);
