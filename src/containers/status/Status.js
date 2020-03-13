/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React from 'react';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';
import moment from 'moment';
import { Tooltip } from '@material-ui/core';
import { Dvr, GitHub } from '@material-ui/icons';
import omg_network from './omisego-blue.svg';

import { selectConnection, selectByzantine, selectLastSync, selectLastSeenBlock } from 'selectors/statusSelector';

import Info from 'components/info/Info';
import Copy from 'components/copy/Copy';
import config from 'util/config';
import networkService from 'services/networkService';

import * as styles from './Status.module.scss';

function Status () {
  const watcherConnection = useSelector(selectConnection);
  const byzantineChain = useSelector(selectByzantine);
  const lastSync = useSelector(selectLastSync);
  const lastSeenBlock = useSelector(selectLastSeenBlock);

  const renderNoConnection = (
    <Tooltip
      title='Currently cannot connect to the Watcher. Either the Watcher is not operational or there is a connection issue. Please wait while we retry the connection.'
      arrow
    >
      <div className={styles.indicator}>
        <span>No Connection</span>
        <div
          className={[
            styles.statusCircle,
            styles.unhealthy
          ].join(' ')}
        />
      </div>
    </Tooltip>
  )

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
            byzantineChain ? styles.unhealthy : styles.healthy
          ].join(' ')}
        />
      </div>
    </Tooltip>
  );

  function renderWatcherStatus () {
    let message = '';
    if (lastSync <= config.checkSyncInterval) {
      message = 'Connected'
    }
    if (lastSync > config.checkSyncInterval) {
      message = 'Syncing'
    }
    return (
      <Tooltip
        title={
          message === 'Syncing'
            ? `A syncing status indicates that the Watcher is still syncing with the rootchain. Transactions will not be reflected so users will not be allowed to make new transactions. Last synced rootchain block was ${moment.unix(lastSeenBlock).fromNow()}.`
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
              message === 'Syncing' ? styles.unhealthy : ''
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
              value: watcherConnection ? renderWatcherStatus() : renderNoConnection
            },
            {
              title: 'Network Status',
              value: watcherConnection ? renderChainHealth : ''
            },
            {
              header: 'Plasma Framework Address',
              title: truncate(networkService.plasmaContractAddress, 10, 4, '...'),
              value: <Copy value={networkService.plasmaContractAddress} />
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
