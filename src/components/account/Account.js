import React from 'react';
import truncate from 'truncate-middle';

import Copy from 'components/copy/Copy';
import Button from 'components/button/Button';
import { Send } from '@material-ui/icons';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account ({ className, childBalance = [], rootBalance = [] }) {
  function renderChildchainBalances () {
    if (childBalance.length) {
      return childBalance.map(i => {
        return {
          title: `OMG Network ${i.symbol} Balance`,
          value: Math.round(Number(i.amount)*10000)/10000
        }
      });
    }
    if (rootBalance.length) {
      return [{
        title: 'OMG Network Balance',
        value: 'None'
      }]
    }
    return [{
      title: 'Balances',
      value: 'Loading...'
    }]
  }

  function renderRootchainBalances () {
    if (rootBalance.length) {
      return rootBalance.map(i => {
        return {
          title: `Rootchain ${i.symbol} Balance`,
          value: Math.round(Number(i.amount)*10000)/10000
        }
      })
    }
    return []
  }

  return (
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
            <div className={styles.transfer}>
              <Send />
              <span>Transfer</span>
            </div>
          </div>
          <div className={styles.row}>
            <span>ETH</span>
            <span>0.1391</span>
          </div>
          <div className={styles.buttons}>
            <Button
              onClick={console.log}
              type='primary'
            >
              DEPOSIT
            </Button>
            <Button
              onClick={console.log}
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
          <div className={styles.row}>
            <span>ETH</span>
            <span>0.1391</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Account;
