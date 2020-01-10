import React, { useState } from 'react';

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

  async function checkWatcherStatus () {
    const { byzantine_events } = await networkService.childChain.status();
    if (byzantine_events.length) {
      setByzantineChain(true);
    }
    if (byzantine_events) {
      setWatcherConnection(true);
    }
  }

  useInterval(checkWatcherStatus, 10000);

  return (
    <div className={styles.Home}>
      <Status
        watcherConnection={watcherConnection}
        byzantineChain={byzantineChain}
      />
      <Account watcherConnection={watcherConnection} />
      <Actions watcherConnection={watcherConnection} />
      <Transactions watcherConnection={watcherConnection} />
    </div>
  );
}

export default Home;
