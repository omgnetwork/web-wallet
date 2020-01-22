import React, { useState } from 'react';
import truncate from 'truncate-middle';
import { Send } from '@material-ui/icons';

import DepositModal from 'containers/modals/DepositModal';
import TransferModal from 'containers/modals/TransferModal';
import ExitModal from 'containers/modals/ExitModal';

import Copy from 'components/copy/Copy';
import Button from 'components/button/Button';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account ({ className, childBalance = [], rootBalance = [] }) {
  const [ depositModal, setDepositModal ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ exitModal, setExitModal ] = useState(false);

  return (
    <>
      <DepositModal open={depositModal} toggle={() => setDepositModal(false)} />
      <TransferModal open={transferModal} toggle={() => setTransferModal(false)} />
      <ExitModal open={exitModal} toggle={() => setExitModal(false)} />

      <div className={[styles.Account, className].join(' ')}>
        <h2>Account</h2>
        <div className={styles.wallet}>
          <span>{`Wallet Address : ${networkService.account ? truncate(networkService.account, 10, 4, '...') : ''}`}</span>
          <Copy value={networkService.account} />
        </div>

        <div className={styles.balances}>
          <div className={styles.box}>
            <div className={styles.header}>
              <div className={styles.title}>
                <span>Balance on Childchain</span>
                <span>OMG Network</span>
              </div>
              <div onClick={() => setTransferModal(true)} className={styles.transfer}>
                <Send />
                <span>Transfer</span>
              </div>
            </div>
            {childBalance.map((i, index) => {
              return (
                <div key={index} className={styles.row}>
                  <span>{i.symbol}</span>
                  <span>{i.amount}</span>
                </div>
              )
            })}
            <div className={styles.buttons}>
              <Button
                onClick={() => setDepositModal(true)}
                type='primary'
              >
                DEPOSIT
              </Button>
              <Button
                onClick={() => setExitModal(true)}
                type='secondary'
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
                  <span>{i.symbol}</span>
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
