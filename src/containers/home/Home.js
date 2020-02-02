import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import config from 'util/config';
import useInterval from 'util/useInterval';
import { selectEthDeposits, selectErc20Deposits } from 'selectors/transactionSelector';
import { selectAllQueues } from 'selectors/queueSelector';
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

  useInterval(() => dispatch(checkWatcherStatus()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchBalances()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchDeposits()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchExits()), POLL_INTERVAL);
  useInterval(() => dispatch(fetchTransactions()), POLL_INTERVAL);

  // const queues = useSelector(selectAllQueues);
  // const ethDeposits = useSelector(selectEthDeposits);
  // const erc20Deposits = useSelector(selectErc20Deposits);
  // const allDeposits = [...ethDeposits, ...erc20Deposits];

  // useEffect(() => {
  //   // fetch queues for all deposits, if not fetched already
  //   if (allDeposits && allDeposits.length) {
  //     for (const deposit of allDeposits) {
  //       const inQueue = queues.some(i => i.currency === deposit.returnValues.token);
  //       if (!inQueue) {
  //         dispatch(getExitQueue(deposit.returnValues.token));
  //       }
  //     }
  //   }
  // }, [allDeposits, dispatch, queues]);

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
