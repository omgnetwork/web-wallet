import React from 'react';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import moment from 'moment';
import { Tooltip } from '@material-ui/core';
import { Dvr, GitHub } from '@material-ui/icons';
import omg_network from './omg_network.svg';

import { selectConnection, selectByzantine, selectLastSync, selectLastSeenBlock } from 'selectors/statusSelector';

import Info from 'components/info/Info';
import Copy from 'components/copy/Copy';
import config from 'util/config';

import * as styles from './Status.module.scss';

function Status () {
  const watcherConnection = useSelector(selectConnection);
  const byzantineChain = useSelector(selectByzantine);
  const lastSync = useSelector(selectLastSync);
  const lastSeenBlock = useSelector(selectLastSeenBlock);

  const renderChainHealth = (
    <Tooltip
      title={
        byzantineChain
          ? 'An unhealthy status will result from byzantine conditions on the network. Users should not transact on the network until the byzantine conditions are cleared.'
          : ''
      }
      arrow
    >
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

  function renderWatcherStatus () {
    let message = '';
    if (lastSync <= 20) {
      message = 'Connected'
    }
    if (lastSync > 20) {
      message = 'Stalled'
    }
    return (
      <Tooltip
        title={
          message === 'Stalled'
            ? `A stalled status indicates that the Watcher is out of sync with the rootchain. Transactions will not be reflected so users will not be allowed to make new transactions. Last synced rootchain block was ${moment.unix(lastSeenBlock).fromNow()}.`
            : ''
        }
        arrow
      >
        <div className={styles.indicator}>
          <span>{message}</span>
          <div
            className={[
              styles.statusCircle,
              message === 'Connected' ? styles.healthy : '',
              message === 'Stalled' ? styles.unhealthy : ''
            ].join(' ')}
          />
        </div>
      </Tooltip>
    );
  }

  return (
    <div className={styles.Status}>
      <div>
        <img className={styles.logo} src={omg_network} alt='omg-network' />
        <Info
          data={[
            {
              title: 'Watcher Status',
              value: renderWatcherStatus()
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
