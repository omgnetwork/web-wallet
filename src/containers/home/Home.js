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

import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq, flatten } from 'lodash';

import { selectChildchainTransactions } from 'selectors/transactionSelector';
import config from 'util/config';
import useInterval from 'util/useInterval';
import {
  checkWatcherStatus,
  fetchBalances,
  fetchTransactions,
  fetchExits,
  fetchDeposits,
  getExitQueue
} from 'actions/networkAction';

import Status from 'containers/status/Status';
import Account from 'containers/account/Account';
import Transactions from 'containers/transactions/Transactions';

import * as styles from './Home.module.scss';

const POLL_INTERVAL = config.pollInterval * 1000;

function Home () {
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const transactions = useSelector(selectChildchainTransactions);
  const inputs = flatten(
    transactions
      .filter(i => i.status !== 'Pending')
      .map(i => i.inputs)
  );
  const transactedTokens = uniq(inputs.map(i => i.currency));

  useInterval(() => {
    dispatch(checkWatcherStatus());
    dispatch(fetchBalances());
    dispatch(fetchDeposits());
    dispatch(fetchExits());
    dispatch(fetchTransactions());

    for (const token of transactedTokens) {
      dispatch(getExitQueue(token));
    }
  }, POLL_INTERVAL);

  return (
    <div className={styles.Home}>
      <Status />

      <div className={styles.main}>
        <Account/>
        <Transactions/>
      </div>
    </div>
  );
}

export default Home;
