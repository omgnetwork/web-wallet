import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uniq } from 'lodash';

import config from 'util/config';
import useInterval from 'util/useInterval';
import { selectEthDeposits, selectErc20Deposits } from 'selectors/transactionSelector';
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

  const ethDeposits = useSelector(selectEthDeposits);
  const erc20Deposits = useSelector(selectErc20Deposits);

  useInterval(() => {
    dispatch(checkWatcherStatus());
    dispatch(fetchBalances());
    dispatch(fetchDeposits());
    dispatch(fetchExits());
    dispatch(fetchTransactions());

    const depositedTokens = uniq([...ethDeposits, ...erc20Deposits].map(i => i.returnValues.token));
    for (const token of depositedTokens) {
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
