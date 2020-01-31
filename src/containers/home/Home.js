import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import config from 'util/config';
import useInterval from 'util/useInterval';
import {
  checkWatcherStatus,
  fetchBalances,
  fetchTransactions,
  fetchExits,
  fetchDeposits
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

  useInterval(() => dispatch(checkWatcherStatus()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchBalances()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchDeposits()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchExits()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchTransactions()), POLL_INTERVAL);

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
