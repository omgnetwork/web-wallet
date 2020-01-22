import React, { useState, useEffect } from 'react';

import useInterval from 'util/useInterval';
import networkService from 'services/networkService';

import Status from 'containers/status/Status';
import Account from 'containers/account/Account';
import Transactions from 'containers/transactions/Transactions';

import * as styles from './Home.module.scss';

function Home () {
  // data store
  const [ watcherConnection, setWatcherConnection ] = useState(false);
  const [ byzantineChain, setByzantineChain ] = useState(false);
  const [ balances, setBalances ] = useState({ rootchain: [], childchain: [] });
  const [ transactions, setTransactions ] = useState([]);

  // data fetch
  useInterval(checkWatcherStatus, 5000);
  useInterval(fetchBalances, 5000);
  useInterval(fetchTransactions, 5000);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function checkWatcherStatus () {
    const { byzantine_events } = await networkService.childChain.status();
    byzantine_events.length
      ? setByzantineChain(true)
      : setByzantineChain(false)
    !!byzantine_events
      ? setWatcherConnection(true)
      : setWatcherConnection(false)
  }

  async function fetchBalances () {
    if (watcherConnection) {
      const _balances = await networkService.getBalances();
      if (_balances) {
        setBalances(_balances);
      }
    }
  }
  async function fetchTransactions () {
    if (watcherConnection) {
      const _transactions = await networkService.childChain.getTransactions({ address: networkService.account });
      setTransactions(_transactions);
    }
  }

  return (
    <div className={styles.Home}>
      <Status
        watcherConnection={watcherConnection}
        byzantineChain={byzantineChain}
      />

      <div className={styles.main}>
        <Account
          childBalance={balances.childchain}
          rootBalance={balances.rootchain}
        />
        <Transactions
          transactions={transactions}
          watcherConnection={watcherConnection}
        />
      </div>
    </div>
  );
}

export default Home;
