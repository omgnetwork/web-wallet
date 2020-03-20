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

import React, { useState } from 'react';
import { orderBy, isEqual } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';

import config from 'util/config';
import networkService from 'services/networkService';
import { selectAllQueues, selectQueues } from 'selectors/queueSelector';
import { selectPendingExits, selectExitedExits } from 'selectors/exitSelector';

import ProcessExitsModal from 'containers/modals/ProcessExitsModal';
import Transaction from 'components/transaction/Transaction';

import * as styles from './Transactions.module.scss';

function Exits ({ searchHistory }) {
  const [ processExitModal, setProcessExitModal ] = useState(false);

  const queues = useSelector(selectAllQueues, isEqual);
  const rawQueues = useSelector(selectQueues, isEqual);
  const pendingExits = orderBy(useSelector(selectPendingExits, isEqual), i => i.blockNumber, 'desc');
  const exitedExits = orderBy(useSelector(selectExitedExits, isEqual), i => i.blockNumber, 'desc');

  // add extra data to pending exits using data from the queue
  function enhanceExits (exits) {
    return exits.map(i => {
      const exitId = networkService.web3.utils.hexToNumberString(i.returnValues.exitId._hex);
      const queuedExit = queues.find(i => i.exitId === exitId);
      let queuePosition;
      let queueLength;
      if (queuedExit) {
        const tokenQueue = rawQueues[queuedExit.currency];
        queuePosition = tokenQueue.findIndex(x => x.exitId === exitId)
        queueLength = tokenQueue.length
      }
      return {
        ...i,
        ...queuedExit
          ? {
            exitableAt: queuedExit.exitableAt,
            currency: queuedExit.currency,
            queuePosition: queuePosition + 1,
            queueLength
          }
          : {}
      }
    });
  }

  const _pendingExits = enhanceExits(pendingExits).filter(i => {
    return i.transactionHash.includes(searchHistory);
  });
  const _exitedExits = exitedExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  });

  return (
    <>
      <ProcessExitsModal
        exitData={processExitModal}
        open={!!processExitModal}
        toggle={() => setProcessExitModal(false)}
      />
      <div className={styles.section}>
        <div className={styles.subTitle}>Exits</div>
        <div className={styles.transactionSection}>
          <div className={styles.transactions}>
            {(!_pendingExits.length && !_exitedExits.length) && (
              <div className={styles.disclaimer}>No exit history.</div>
            )}
            {_pendingExits.map((i, index) => {
              const exitableMoment = moment.unix(i.exitableAt);
              const isExitable = moment().isAfter(exitableMoment);
              return (
                <Transaction
                  key={index}
                  button={
                    isExitable
                      ? {
                        onClick: () => setProcessExitModal(i),
                        text: 'Process Exit'
                      }
                      : undefined
                  }
                  link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                  status={
                    i.status === 'Confirmed' && i.pendingPercentage >= 100
                      ? 'Challenge Period'
                      : i.status
                  }
                  subStatus={`Block ${i.blockNumber}`}
                  statusPercentage={i.pendingPercentage <= 100 ? i.pendingPercentage : ''}
                  title={truncate(i.transactionHash, 10, 4, '...')}
                  midTitle={i.exitableAt ? `Exitable ${exitableMoment.format('lll')}` : ''}
                  subTitle={i.currency ? truncate(i.currency, 10, 4, '...'): ''}
                />
              );
            })}
            {_exitedExits.map((i, index) => {
              return (
                <Transaction
                  key={index}
                  link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                  status='Exited'
                  subStatus={`Block ${i.blockNumber}`}
                  title={truncate(i.transactionHash, 10, 4, '...')}
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

export default Exits;
