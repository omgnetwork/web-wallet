import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq, difference } from 'lodash';

import config from 'util/config';
import useInterval from 'util/useInterval';
import { selectLoading } from 'selectors/loadingSelector';
import { selectEthDeposits, selectErc20Deposits } from 'selectors/transactionSelector';
import { selectQueuedTokens } from 'selectors/queueSelector';
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

  // prefetch exit queues for all tokens ever deposited
  const queueFetchLoading = useSelector(selectLoading(['QUEUE/GET']));
  const queuedTokens = useSelector(selectQueuedTokens);
  const ethDeposits = useSelector(selectEthDeposits);
  const erc20Deposits = useSelector(selectErc20Deposits);

  const depositedTokens = uniq([...ethDeposits, ...erc20Deposits].map(i => i.returnValues.token));
  const unqueuedTokens = difference(depositedTokens, queuedTokens);

  useEffect(() => {
    async function fetchQueues () {
      if (!queueFetchLoading && unqueuedTokens && unqueuedTokens.length) {
        for (const token of unqueuedTokens) {
          await dispatch(getExitQueue(token));
        }
      }
    }
    fetchQueues();
  }, [queueFetchLoading, unqueuedTokens, dispatch]);

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
