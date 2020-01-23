import React from 'react';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import { Tooltip } from '@material-ui/core';
import { Dvr, GitHub } from '@material-ui/icons';

import { selectConnection, selectByzantine } from 'selectors/statusSelector';

import Info from 'components/info/Info';
import Copy from 'components/copy/Copy';
import config from 'util/config';

import * as styles from './Status.module.scss';

function Status () {
  const watcherConnection = useSelector(selectConnection);
  const byzantineChain = useSelector(selectByzantine);

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
      <span>{watcherConnection ? 'Connected' : 'None'}</span>
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
      <div>
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
              value: <Copy value={config.plasmaFrameworkAddress} />
            },
            {
              header: 'Watcher URL', 
              title: config.watcherUrl,
              value: <Copy value={config.watcherUrl} />
            },
            {
              header: 'Block Explorer', 
              title: config.blockExplorerUrl,
              value: (
                <a
                  href={config.blockExplorerUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.icon}
                >
                  <Dvr />
                </a>
              )
            }
          ]}
        />
      </div>
      <div>
        <a
          href='https://github.com/omisego/react-starter-kit'
          target='_blank'
          rel='noopener noreferrer'
          className={styles.github}
        >
          <GitHub />
        </a>
      </div>
    </div>
  );
}

export default Status;
