import React, { useState } from 'react';
import { orderBy } from 'lodash';
import { useSelector } from 'react-redux';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import { selectChildchainTransactions } from 'selectors/transactionSelector';
import networkService from 'services/networkService';
import config from 'util/config';

import Tabs from 'components/tabs/Tabs';
import Input from 'components/input/Input';
import Transaction from 'components/transaction/Transaction';

import Exits from './Exits';
import Deposits from './Deposits';

import * as styles from './Transactions.module.scss';

function Transactions () {
  const unorderedTransactions = useSelector(selectChildchainTransactions);
  const transactions = orderBy(unorderedTransactions, i => i.block.timestamp, 'desc');

  const [ searchHistory, setSearchHistory ] = useState('');
  const [ activeTab, setActiveTab ] = useState('Transactions');

  function calculateOutputAmount (utxo) {
    if (utxo.status === 'Pending') {
      return 'Pending'
    }
    const total = utxo.outputs.reduce((prev, curr) => {
      if (curr.owner !== networkService.account) {
        return prev.add(new BN(curr.amount))
      }
      return prev;
    }, new BN(0));
    return `${total.toString()}`;
  }

  const _transactions = transactions.filter(i => {
    return i.txhash.includes(searchHistory) || i.metadata.toLowerCase().includes(searchHistory);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>History</h2>
        <Input
          icon
          placeholder='Search history'
          value={searchHistory}
          onChange={i => setSearchHistory(i.target.value.toLowerCase())}
          className={styles.searchBar}
        />
      </div>

      <div className={styles.data}>
        <div className={styles.section}>
          <Tabs
            onClick={setActiveTab}
            activeTab={activeTab}
            tabs={[ 'Transactions', 'Deposits' ]}
          />

          {activeTab === 'Transactions' && (
            <div className={styles.transactions}>
              {!_transactions.length && (
                <div className={styles.disclaimer}>No transaction history.</div>
              )}
              {_transactions.map((i, index) => {
                return (
                  <Transaction
                    key={index}
                    link={
                      i.status === 'Pending'
                        ? undefined
                        : `${config.blockExplorerUrl}/transaction/${i.txhash}`
                    }
                    title={`${truncate(i.txhash, 10, 4, '...')}`}
                    midTitle={i.metadata ? i.metadata : undefined}
                    subTitle={moment.unix(i.block.timestamp).format('lll')}
                    status={calculateOutputAmount(i)}
                    subStatus={`Block ${i.block.blknum}`}
                  />
                );
              })}
            </div>
          )}

          {activeTab === 'Deposits' && <Deposits searchHistory={searchHistory} />}
        </div>

        <Exits searchHistory={searchHistory} />
      </div>
    </div>
  );
}

export default Transactions;
