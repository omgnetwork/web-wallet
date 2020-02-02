import React, { useState } from 'react';
import { orderBy } from 'lodash';
import moment from 'moment';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';

import config from 'util/config';
import networkService from 'services/networkService';
import { selectAllQueues } from 'selectors/queueSelector';
import { selectPendingExits, selectExitedExits } from 'selectors/exitSelector';

import ProcessExitsModal from 'containers/modals/ProcessExitsModal';
import Transaction from 'components/transaction/Transaction';

import * as styles from './Transactions.module.scss';

function Exits ({ searchHistory }) {
  const [ processExitModal, setProcessExitModal ] = useState(false);

  const queues = useSelector(selectAllQueues);
  const pendingExits = orderBy(useSelector(selectPendingExits), i => i.blockNumber, 'desc');
  const exitedExits = orderBy(useSelector(selectExitedExits), i => i.blockNumber, 'desc');

  // add extra data to the exit retrieved from the queue
  const enhancedPendingExits = pendingExits.map(i => {
    const exitId = networkService.web3.utils.hexToNumberString(i.returnValues.exitId._hex);
    const queuedExit = queues.find(i => i.exitId === exitId);
    return {
      ...i,
      ...queuedExit
        ? {
          exitableAt: moment.unix(queuedExit.exitableAt).format('lll'),
          currency: queuedExit.currency,
          queuePosition: 0
        }
        : {}
    }
  });

  const _pendingExits = enhancedPendingExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  });
  const _exitedExits = exitedExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  });

  return (
    <>
      <ProcessExitsModal
        open={processExitModal}
        toggle={() => setProcessExitModal(false)}
      />
      <div className={styles.section}>
        <div className={styles.subTitle}>
          <span>Exits</span>
          {!!_pendingExits.length && (
            <div
              onClick={() => setProcessExitModal(true)}
              className={styles.processExitButton}
            >
              Process Exits
            </div>
          )}
        </div>
        <div className={styles.transactionSection}>
          <div className={styles.transactions}>
            {(!_pendingExits.length && !_exitedExits.length) && (
              <div className={styles.disclaimer}>No exit history.</div>
            )}
            {_pendingExits.map((i, index) => {
              return (
                <Transaction
                  key={index}
                  link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                  status={i.status === 'Pending' ? 'Pending' : 'Exit Started'}
                  statusPercentage={i.pendingPercentage}
                  subStatus={i.exitableAt ? `Exitable on ${i.exitableAt}` : ''}
                  title={truncate(i.transactionHash, 10, 4, '...')}
                  subTitle={`Block ${i.blockNumber}`}
                />
              );
            })}
            {_exitedExits.map((i, index) => {
              return (
                <Transaction
                  key={index}
                  link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                  status='Exited'
                  title={truncate(i.transactionHash, 10, 4, '...')}
                  subTitle={`Block ${i.blockNumber}`}
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
