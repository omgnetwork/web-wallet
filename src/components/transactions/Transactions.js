import React, { useState, useEffect } from 'react';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import networkService from 'services/networkService';
import Transaction from 'components/transaction/Transaction';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection }) {
  const [ loading, setLoading ] = useState(true);
  const [ transactions, setTransactions ] = useState([]);

  useEffect(() => {
    async function fetchTransactions () {
      const transactions = await networkService.childChain.getTransactions({ address: networkService.account });
      setTransactions(transactions);
      setLoading(false);
    }
    if (watcherConnection) {
      fetchTransactions();
    }
  }, [watcherConnection])

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
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className={styles.Transactions}>
          {!transactions.length && <div>No transaction history for this account. Transfer some funds on the OMG Network using the buttons at the top.</div>}
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
      )}
    </>
  );
}

export default Transactions;
