import React, { useState, useEffect } from 'react';

import useInterval from 'util/useInterval';
import networkService from 'services/networkService';

import Status from 'components/status/Status';
import Account from 'components/account/Account';
import Actions from 'components/actions/Actions';
import Transactions from 'components/transactions/Transactions';

import * as styles from './Home.module.scss';

function Home () {
  const [ watcherConnection, setWatcherConnection ] = useState(false);
  const [ byzantineChain, setByzantineChain ] = useState(false);
  const [ rootBalance, setRootBalance ] = useState([]);
  const [ childBalance, setChildBalance ] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function fetchBalances () {
    if (watcherConnection) {
      const balances = await networkService.getBalances();
      if (balances) {
        setRootBalance(balances.rootchain);
        setChildBalance(balances.childchain);
      }
    }
  }

  async function checkWatcherStatus () {
    const { byzantine_events } = await networkService.childChain.status();
    byzantine_events.length
      ? setByzantineChain(true)
      : setByzantineChain(false)
    !!byzantine_events
      ? setWatcherConnection(true)
      : setWatcherConnection(false)
  }

  useInterval(checkWatcherStatus, 5000);
  useInterval(fetchBalances, 5000);

  return (
    <div className={styles.Home}>
      <Actions
        watcherConnection={watcherConnection}
        childBalance={childBalance}
      />

      <div className={styles.row}>
        <Account
          className={styles.account}
          childBalance={childBalance}
          rootBalance={rootBalance}
        />
        <Status
          className={styles.status}
          watcherConnection={watcherConnection}
          byzantineChain={byzantineChain}
        />
      </div>

      <Transactions
        watcherConnection={watcherConnection}
      />
    </div>
  );
}

export default Home;
