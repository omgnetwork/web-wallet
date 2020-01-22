import React, { useState } from 'react';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import Input from 'components/input/Input';
import Transaction from 'components/transaction/Transaction';
import networkService from 'services/networkService';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection, transactions = [] }) {
  const [ searchHistory, setSearchHistory ] = useState('');

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
    return i.txhash.includes(searchHistory)
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
              <Transaction
                key={index}
                title={truncate(i.txhash, 10, 4, '...')}
                subTitle={moment.unix(i.block.timestamp).format('lll')}
                status={calculateOutput(i)}
                subStatus={`Block ${i.block.blknum}`}
              />
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
      </div>
    </div>
  );
}

export default Transactions;
