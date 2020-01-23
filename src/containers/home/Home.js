import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { checkWatcherStatus, fetchBalances } from 'actions/networkAction';
import useInterval from 'util/useInterval';

import Status from 'containers/status/Status';
import Account from 'containers/account/Account';
import Transactions from 'containers/transactions/Transactions';

import * as styles from './Home.module.scss';

function Home () {
  const dispatch = useDispatch();

  const [ transactions, setTransactions ] = useState([]);
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useInterval(() => dispatch(checkWatcherStatus()), 5000);
  useInterval(() => dispatch(fetchBalances()), 5000);
  // useInterval(fetchTransactions, 5000);

  // async function fetchTransactions () {
  //   if (watcherConnection) {
  //     const _transactions = await networkService.childChain.getTransactions({ address: networkService.account });
  //     setTransactions(_transactions);
  //   }
  // }

  return (
    <div className={styles.Home}>
      <Status />

      <div className={styles.main}>
        <Account/>
        <Transactions
          transactions={transactions}
        />
      </div>
    </div>
  );
}

export default Home;
