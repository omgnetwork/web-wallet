import React from 'react';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import networkService from 'services/networkService';
import Transaction from 'components/transaction/Transaction';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection, transactions = [] }) {
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

  return (
    <>
      <h2>History</h2>
      <div className={styles.subTitle}>
        <span>Transactions</span>
      </div>
      <div className={styles.Transactions}>
        {transactions.map((i, index) => {
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
    </>
  );
}

export default Transactions;
