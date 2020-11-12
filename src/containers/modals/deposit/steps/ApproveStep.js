import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import BN from 'bn.js';

import Button from 'components/button/Button';
import GasPicker from 'components/gaspicker/GasPicker';

import { approveErc20, depositErc20, resetApprove } from 'actions/networkAction';
import { openAlert, setActiveHistoryTab } from 'actions/uiAction';
import networkService from 'services/networkService';
import { selectLoading } from 'selectors/loadingSelector';
import { powAmount, logAmount } from 'util/amountConvert';

import * as styles from '../DepositModal.module.scss';

function ApproveStep ({
  onClose,
  currency,
  value,
  tokenInfo
}) {
  const dispatch = useDispatch();
  const [ allowance, setAllowance ] = useState('');
  const [ allowDeposit, setAllowDeposit ] = useState(false);
  const [ selectedSpeed, setSelectedSpeed ] = useState('normal');
  const [ gasPrice, setGasPrice ] = useState();

  const resetLoading = useSelector(selectLoading([ 'APPROVE/RESET' ]));
  const approveLoading = useSelector(selectLoading([ 'APPROVE/CREATE' ]));
  const depositLoading = useSelector(selectLoading([ 'DEPOSIT/CREATE' ]));
  const weiAmount = powAmount(value, tokenInfo.decimals);

  const checkAllowance = useCallback(async () => {
    try {
      const allowance = await networkService.checkAllowance(currency);
      setAllowance(allowance);
      const allowanceBN = new BN(allowance);
      const weiAmountBN = new BN(weiAmount);
      allowanceBN.gte(weiAmountBN)
        ? setAllowDeposit(true)
        : setAllowDeposit(false);
    } catch (error) {
      onClose();
    }
  }, [ onClose, currency, weiAmount ]);

  useEffect(() => {
    checkAllowance();
  }, [ checkAllowance ]);

  function handleClose () {
    setAllowance('');
    setAllowance(false);
    setSelectedSpeed('normal');
    onClose();
  }

  async function doApprove () {
    const res = await dispatch(approveErc20(weiAmount, currency, gasPrice));
    if (res) {
      dispatch(openAlert('ERC20 approval submitted.'));
      checkAllowance();
    }
  }

  async function doReset () {
    const res = await dispatch(resetApprove(weiAmount, currency, gasPrice));
    if (res) {
      dispatch(openAlert('ERC20 approval reset successful.'));
      checkAllowance();
    }
  }

  async function doDeposit () {
    const res = await dispatch(depositErc20(weiAmount, currency, gasPrice));
    if (res) {
      dispatch(setActiveHistoryTab('Deposits'));
      dispatch(openAlert('ERC20 deposit submitted.'));
      handleClose();
    }
  }

  const renderCancelButton = (
    <Button
      onClick={handleClose}
      type='outline'
      style={{ flex: 0 }}
    >
      CANCEL
    </Button>
  );

  const renderGasPicker = (
    <GasPicker
      selectedSpeed={selectedSpeed}
      setSelectedSpeed={setSelectedSpeed}
      setGasPrice={setGasPrice}
    />
  );

  const tokenName = tokenInfo.name || tokenInfo.currency;

  return (
    <>
      <h2>Approval</h2>

      {!allowance && (
        <div className={styles.loader}>
          <span>Checking allowance...</span>
        </div>
      )}

      {allowance === '0' && (
        <>
          <p>
            {`In order to deposit ${value.toString()} ${tokenName}, you first need to approve this amount. Click below to submit an approval transaction.`}
          </p>
          {renderGasPicker}
          <div className={styles.buttons}>
            {renderCancelButton}
            <Button
              onClick={doApprove}
              type='primary'
              style={{ flex: 0 }}
              tooltip='Your approval transaction is still pending. Please wait for confirmation.'
              loading={approveLoading}
              disabled={approveLoading}
            >
              APPROVE
            </Button>
          </div>
        </>
      )}

      {allowance && allowance !== '0' && new BN(allowance).lt(new BN(weiAmount)) && (
        <>
          <p>
            {`You are only approved to deposit ${logAmount(allowance, tokenInfo.decimals)} ${tokenName}. Since you want to deposit ${value} ${tokenName}, you will need to reset your allowance.`}
          </p>
          <p>
            You will be prompted with 2 approval requests. One to reset the allowance to 0, and another for the new amount.
          </p>
          {renderGasPicker}
          <div className={styles.buttons}>
            {renderCancelButton}
            <Button
              onClick={doReset}
              type='primary'
              style={{ flex: 0 }}
              tooltip='Your reset transaction is still pending. Please wait for confirmation.'
              loading={resetLoading}
              disabled={resetLoading}
            >
              RESET
            </Button>
          </div>
        </>
      )}

      {allowDeposit && (
        <>
          <p>
            {`Your approval request for ${value} ${tokenName} was confirmed. Click below to make the deposit.`}
          </p>
          {renderGasPicker}
          <div className={styles.buttons}>
            {renderCancelButton}
            <Button
              onClick={doDeposit}
              type='primary'
              style={{ flex: 0 }}
              tooltip='Your deposit transaction is still pending. Please wait for confirmation.'
              loading={depositLoading}
              disabled={depositLoading}
            >
              DEPOSIT
            </Button>
          </div>
        </>
      )}
    </>
  );
}

export default React.memo(ApproveStep);
