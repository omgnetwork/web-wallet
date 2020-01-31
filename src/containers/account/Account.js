import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import { Send } from '@material-ui/icons';

import { selectLastSync } from 'selectors/statusSelector';
import { selectChildchainBalance, selectRootchainBalance } from 'selectors/balanceSelector';
import { selectPendingExits } from 'selectors/exitSelector';

import DepositModal from 'containers/modals/DepositModal';
import TransferModal from 'containers/modals/TransferModal';
import ExitModal from 'containers/modals/ExitModal';

import Copy from 'components/copy/Copy';
import Button from 'components/button/Button';
import config from 'util/config';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account () {
  const lastSync = useSelector(selectLastSync);
  const childBalance = useSelector(selectChildchainBalance);
  const rootBalance = useSelector(selectRootchainBalance);
  const pendingExits = useSelector(selectPendingExits);

  const isPending = pendingExits.some(i => i.status === 'Pending');
  const isStalled = lastSync ? lastSync > config.checkSyncInterval : true;

  const [ depositModal, setDepositModal ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ exitModal, setExitModal ] = useState(false);

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
              <div
                onClick={() => setTransferModal(true)}
                className={[
                  styles.transfer,
                  !childBalance.length || isPending || isStalled
                    ? styles.disabled
                    : ''
                ].join(' ')}
              >
                <Send />
                <span>Transfer</span>
              </div>
            </div>
            {childBalance.map((i, index) => {
              return (
                <div key={index} className={styles.row}>
                  <div className={styles.token}>
                    <span className={styles.symbol}>{i.symbol}</span>
                    <Copy light value={i.token} />
                  </div>
                  <span>{i.amount}</span>
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
                disabled={
                  !childBalance.length ||
                  isPending ||
                  isStalled
                }
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
                    <span className={styles.symbol}>{i.symbol}</span>
                    <Copy light value={i.token} />
                  </div>
                  <span>{i.amount}</span>
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
