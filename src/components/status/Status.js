import React from 'react';
import truncate from 'truncate-middle';
import { Tooltip } from '@material-ui/core';

import Info from 'components/info/Info';
import config from 'util/config';

import * as styles from './Status.module.scss';

function Status ({ watcherConnection, byzantineChain, className }) {
  const renderChainHealth = (
    <Tooltip title='An unhealthy status will result from a ChildChain with byzantine conditions. Users should proceed cautiously until the byzantine conditions are cleared.' arrow>
      <div className={styles.indicator}>
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
    <div className={styles.indicator}>
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
    <div className={styles.Status}>
      <h1>{'OMG\nNETWORK'}</h1>
      <Info
        data={[
          {
            title: 'Watcher Status',
            value: renderWatcherStatus
          },
          {
            title: 'Network Status',
            value: watcherConnection ? renderChainHealth : ''
          },
          {
            header: 'Plasma Framework Address',
            title: truncate(config.plasmaFrameworkAddress, 10, 4, '...'),
            value: 'copy'
          },
          {
            header: 'Watcher URL', 
            title: config.watcherUrl,
            value: 'copy'
          }
        ]}
      />
    </div>
  )
}

export default Status;
