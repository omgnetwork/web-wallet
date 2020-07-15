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
import { Dvr, GitHub } from '@material-ui/icons';

import { selectConnection, selectByzantine, selectIsSynced } from 'selectors/statusSelector';

import Info from 'components/info/Info';
import Copy from 'components/copy/Copy';
import Tooltip from 'components/tooltip/Tooltip';
import config from 'util/config';
import { getShortNetworkName } from 'util/networkName';
import networkService from 'services/networkService';

import * as styles from './Status.module.scss';

function Status ({ className }) {
  const watcherConnection = useSelector(selectConnection);
  const byzantineChain = useSelector(selectByzantine);
  const isSynced = useSelector(selectIsSynced);

  const renderNoConnection = (
    <Tooltip title='Currently cannot connect to the Watcher. Either the Watcher is not operational or there is a connection issue. Please wait while we retry the connection.'>
      <div className={styles.indicator}>
        <div
          className={[
            styles.statusCircle,
            styles.unhealthy
          ].join(' ')}
        />
        <span className={styles.unhealthyText}>
          No Connection
        </span>
      </div>
    </Tooltip>
  );

  const renderChainHealth = (
    <Tooltip
      title={
        byzantineChain
          ? 'An unhealthy status will result from byzantine conditions on the network. Users should not transact on the network until the byzantine conditions are cleared.'
          : 'A healthy status means there are no byzantine conditions on the network.'}
    >
      <div className={styles.indicator}>
        <div
          className={[
            styles.statusCircle,
            byzantineChain ? styles.unhealthy : styles.healthy
          ].join(' ')}
        />
        <span
          className={
            byzantineChain
              ? styles.unhealthyText
              : styles.healthyText
          }
        >
          {byzantineChain ? 'Unhealthy' : 'Healthy'}
        </span>
      </div>
    </Tooltip>
  );

  const renderWatcherStatus = (
    <Tooltip
      title={
        isSynced
          ? 'Watcher is caught up with the current child chain blocks'
          : 'Watcher syncing status indicates that the Watcher is still catching up with the most recent child chain blocks. Transaction status will be delayed so users should wait until the Watcher is fully synced.'}
    >
      <div className={styles.indicator}>
        <div
          className={[
            styles.statusCircle,
            isSynced ? styles.healthy : '',
            !isSynced ? styles.unhealthy : ''
          ].join(' ')}
        />
        <span
          className={
            isSynced
              ? styles.healthyText
              : styles.unhealthyText
          }
        >
          {isSynced ? 'Connected' : 'Syncing'}
        </span>
      </div>
    </Tooltip>
  );

  return (
    <div
      className={[
        styles.Status,
        className
      ].join(' ')}
    >
      <div>
        <Info
          data={[
            {
              title: 'Watcher Status',
              value: watcherConnection ? renderWatcherStatus : renderNoConnection
            },
            {
              title: 'Network Status',
              value: watcherConnection ? renderChainHealth : ''
            },
            {
              title: 'Environment',
              value: getShortNetworkName()
            },
            {
              header: 'Plasma Framework Address',
              title: truncate(networkService.plasmaContractAddress, 6, 4, '...'),
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
          href='https://github.com/omgnetwork/web-wallet'
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

export default React.memo(Status);
