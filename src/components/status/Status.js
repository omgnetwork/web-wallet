import React from 'react';
import truncate from 'truncate-middle';
import { Tooltip } from '@material-ui/core';

import Box from 'components/box/Box';
import Info from 'components/info/Info';
import config from 'config';

import * as styles from './Status.module.scss';

function Status ({ watcherConnection, byzantineChain }) {
  const renderChainHealth = (
    <Tooltip title='An unhealthy status will result from a ChildChain with byzantine conditions. Users should proceed cautiously until the byzantine conditions are cleared.' arrow>
      <div className={styles.Status}>
        <span>{byzantineChain ? 'Unhealthy' : 'Healthy'}</span>
        <div
          className={[
            styles.statusCircle,
            byzantineChain ? '' : styles.healthy
          ].join(' ')}
        />
      </div>
    </Tooltip>
  );

  const renderWatcherStatus = (
    <div className={styles.Status}>
      <span>{watcherConnection ? 'Connected' : 'Error'}</span>
      <div
        className={[
          styles.statusCircle,
          watcherConnection ? styles.healthy : ''
        ].join(' ')}
      />
    </div>
  );

  return (
    <Box>
      <h2>OMG Network Status</h2>
      <Info
        data={[
          {
            title: 'Plasma Framework',
            value: truncate(config.plasmaFrameworkAddress, 6, 4, '...')
          },
          {
            title: 'Watcher',
            value: config.watcherUrl
          },
          {
            title: 'Watcher Status',
            value: renderWatcherStatus
          },
          {
            title: 'ChildChain Status',
            value: watcherConnection ? renderChainHealth : ''
          },
        ]}
      />
    </Box>
  )
}

export default Status;
