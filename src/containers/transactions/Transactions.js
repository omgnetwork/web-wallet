/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React, { useState } from 'react';
import { orderBy, isEqual } from 'lodash';
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
  const [ searchHistory, setSearchHistory ] = useState('');
  const [ activeTab, setActiveTab ] = useState('Transactions');

  const unorderedTransactions = useSelector(selectChildchainTransactions, isEqual);
  const transactions = orderBy(unorderedTransactions, i => i.block.timestamp, 'desc');

  function renderStatus (utxo) {
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
                    status={renderStatus(i)}
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
