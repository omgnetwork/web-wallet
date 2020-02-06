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
