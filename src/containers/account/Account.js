import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import { Send, MergeType } from '@material-ui/icons';

import { selectLastSync } from 'selectors/statusSelector';
import { selectChildchainBalance, selectRootchainBalance } from 'selectors/balanceSelector';
import { selectPendingExits } from 'selectors/exitSelector';
import { selectChildchainTransactions } from 'selectors/transactionSelector';

import DepositModal from 'containers/modals/DepositModal';
import TransferModal from 'containers/modals/TransferModal';
import ExitModal from 'containers/modals/ExitModal';
import MergeModal from 'containers/modals/MergeModal';

import Copy from 'components/copy/Copy';
import Button from 'components/button/Button';
import config from 'util/config';
import { logAmount } from 'util/amountConvert';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account () {
  const lastSync = useSelector(selectLastSync);
  const childBalance = useSelector(selectChildchainBalance);
  const rootBalance = useSelector(selectRootchainBalance);
  const pendingExits = useSelector(selectPendingExits);
  const transactions = useSelector(selectChildchainTransactions);

  const exitPending = pendingExits.some(i => i.status === 'Pending');
  const transferPending = transactions.some(i => i.status === 'Pending');
  const isStalled = lastSync ? lastSync > config.checkSyncInterval : true;
  const disabled = !childBalance.length || isStalled || exitPending || transferPending;

  const [ depositModal, setDepositModal ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ exitModal, setExitModal ] = useState(false);
  const [ mergeModal, setMergeModal ] = useState(false);

  return (
    <>
      <DepositModal
        open={depositModal}
        toggle={() => setDepositModal(false)}
      />
      <TransferModal
        open={transferModal}
        toggle={() => setTransferModal(false)}
        balances={childBalance}
      />
      <ExitModal
        open={exitModal}
        toggle={() => setExitModal(false)}
      />
      <MergeModal
        open={mergeModal}
        toggle={() => setMergeModal(false)}
      />

      <div className={styles.Account}>
        <h2>Account</h2>
        <div className={styles.wallet}>
          <span className={styles.address}>{`Wallet Address : ${networkService.account ? truncate(networkService.account, 10, 4, '...') : ''}`}</span>
          <Copy value={networkService.account} />
        </div>

        <div className={styles.balances}>
          <div className={styles.box}>
            <div className={styles.header}>
              <div className={styles.title}>
                <span>Balance on Childchain</span>
                <span>OMG Network</span>
              </div>
              <div className={styles.actions}>
                <div
                  onClick={() => setMergeModal(true)}
                  className={[
                    styles.transfer,
                    disabled ? styles.disabled : ''
                  ].join(' ')}
                >
                  <MergeType />
                  <span>Merge</span>
                </div>
                <div
                  onClick={() => setTransferModal(true)}
                  className={[
                    styles.transfer,
                    disabled ? styles.disabled : ''
                  ].join(' ')}
                >
                  <Send />
                  <span>Transfer</span>
                </div>
              </div>
            </div>
            {childBalance.map((i, index) => {
              return (
                <div key={index} className={styles.row}>
                  <div className={styles.token}>
                    <span className={styles.symbol}>{i.name}</span>
                    <Copy light value={i.currency} />
                  </div>
                  <span>{logAmount(i.amount, i.decimals)}</span>
                </div>
              )
            })}
            <div className={styles.buttons}>
              <Button
                onClick={() => setDepositModal(true)}
                type='primary'
                disabled={isStalled}
              >
                DEPOSIT
              </Button>
              <Button
                onClick={() => setExitModal(true)}
                type='secondary'
                disabled={disabled}
              >
                EXIT
              </Button>
            </div>
          </div>

          <div className={styles.box}>
            <div className={styles.header}>
              <div className={styles.title}>
                <span>Balance on Rootchain</span>
                <span>Ethereum Network</span>
              </div>
            </div>

            {rootBalance.map((i, index) => {
              return (
                <div key={index} className={styles.row}>
                  <div className={styles.token}>
                    <span className={styles.symbol}>{i.name}</span>
                    <Copy light value={i.currency} />
                  </div>
                  <span>{logAmount(i.amount, i.decimals)}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Account;
