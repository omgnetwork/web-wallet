import React, { useState, useEffect } from 'react';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import Input from 'components/input/Input';
import Transaction from 'components/transaction/Transaction';
import networkService from 'services/networkService';
import config from 'util/config';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection, transactions = [] }) {
  const [ searchHistory, setSearchHistory ] = useState('');
  const [ pendingExits, setPendingExits ] = useState([]);

  useEffect(() => {
    async function fetchExits () {
      const _pendingExits = await networkService.getPendingExits();
      setPendingExits(_pendingExits);
    }
    fetchExits();
  }, []);

  function calculateOutput (utxo) {
    // TODO: logic to handle different currencies and to whom
    const total = utxo.outputs.reduce((prev, curr) => {
      if (curr.owner !== networkService.account && curr.currency === networkService.OmgUtil.transaction.ETH_CURRENCY) {
        return prev.add(new BN(curr.amount))
      }
      return prev;
    }, new BN(0));
    return `${total.toString()} wei`;
  }

  const _transactions = transactions.filter(i => {
    // TODO: what do we search by
    return i.txhash.includes(searchHistory);
  })
  const _pendingExits = pendingExits.filter(i => {
    // TODO: what do we search by
    return i.transactionHash.includes(searchHistory);
  })

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h2 className={styles.history}>History</h2>
        <div className={styles.subTitle}>
          <span>Transactions</span>
        </div>
        <div className={styles.transactions}>
          {_transactions.map((i, index) => {
            return (
              <a
                href={`${config.blockExplorerUrl}/transaction/${i.txhash}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Transaction
                  key={index}
                  title={truncate(i.txhash, 10, 4, '...')}
                  subTitle={moment.unix(i.block.timestamp).format('lll')}
                  status={calculateOutput(i)}
                  subStatus={`Block ${i.block.blknum}`}
                />
              </a>
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <Input
          icon
          placeholder='Search history'
          value={searchHistory}
          onChange={i => setSearchHistory(i.target.value)}
          className={styles.searchBar}
        />
        <div className={styles.subTitle}>
          <span>Exits</span>
        </div>
        <div className={styles.transactions}>
          {_pendingExits.map((i, index) => {
            return (
              <a
                href={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                target='_blank'
                rel='noopener noreferrer'
              >
                <Transaction
                  key={index}
                  status='Pending'
                  title={truncate(i.transactionHash, 10, 4, '...')}
                  subTitle={`Block ${i.blockNumber}`}
                />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Transactions;
