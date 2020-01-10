import React, { useState } from 'react';
import { truncate } from 'lodash';

import Box from 'components/box/Box';
import Info from 'components/info/Info';
import useInterval from 'util/useInterval';
import networkService from 'services/networkService';
import config from 'config';

import * as styles from './Home.module.scss';

function Home () {
  const [ watcherStatus, setWatcherStatus ] = useState(false);

  async function checkWatcherStatus () {
    const { byzantine_events } = await networkService.childChain.status();
    if (byzantine_events && !byzantine_events.length) {
      setWatcherStatus(true);
    }
  }

  useInterval(checkWatcherStatus, 10000);

  const renderWatcherStatus = (
    <div className={styles.status}>
      <span>{watcherStatus ? 'Healthy' : 'Unhealthy'}</span>
      <div
        className={[
          styles.statusCircle,
          watcherStatus ? styles.healthy : ''
        ].join(' ')}
      />
    </div>
  );

  return (
    <div className={styles.Home}>
      <Box>
        <h2>OMG Network Wallet</h2>
        <Info
          data={[
            {
              title: 'Plasma Framework',
              value: truncate(config.plasmaFrameworkAddress)
            },
            {
              title: 'Watcher',
              value: config.watcherUrl
            },
            {
              title: 'Watcher Status',
              value: renderWatcherStatus
            },
          ]}
        />
      </Box>
    </div>
  )
}

export default Home;
