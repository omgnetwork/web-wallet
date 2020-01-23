import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import BN from 'bn.js';
import moment from 'moment';
import truncate from 'truncate-middle';

import { selectChildchainTransactions } from 'selectors/transactionSelector';

import ProcessExitsModal from 'containers/modals/ProcessExitsModal';

import Input from 'components/input/Input';
import Transaction from 'components/transaction/Transaction';
import networkService from 'services/networkService';
import useInterval from 'util/useInterval';
import config from 'util/config';

import * as styles from './Transactions.module.scss';

function Transactions () {
  const ccTransactions = useSelector(selectChildchainTransactions);

  const [ searchHistory, setSearchHistory ] = useState('');
  const [ processExitModal, setProcessExitModal ] = useState(false);

  const [ pendingExits, setPendingExits ] = useState([]);
  const [ processableExits, setProcessableExits ] = useState([]);
  const [ exitedExits, setExitedExits ] = useState([]);

  async function fetchExits () {
    const { pending, processable, exited } = await networkService.getExits();
    setPendingExits(pending);
    setProcessableExits(processable);
    setExitedExits(exited);
  }

  useInterval(fetchExits, 10000);

  function calculateOutput (utxo) {
    // TODO: logic to handle different currencies and to whom
    const total = utxo.outputs.reduce((prev, curr) => {
      if (curr.owner !== networkService.account && curr.currency === networkService.OmgUtil.transaction.ETH_CURRENCY) {
        return prev.add(new BN(curr.amount))
      }
      return prev;
    }, new BN(0));
    return `${total.toString()} wei`;
  }

  const _transactions = ccTransactions.filter(i => {
    return i.txhash.includes(searchHistory);
  })
  const _pendingExits = pendingExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  })
  const _processableExits = processableExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  })
  const _exitedExits = exitedExits.filter(i => {
    return i.transactionHash.includes(searchHistory);
  })

  return (
    <div className={styles.container}>
      <ProcessExitsModal
        open={!!processExitModal}
        utxo={processExitModal}
        toggle={() => setProcessExitModal(false)}
      />
      <div className={styles.section}>
        <h2 className={styles.history}>History</h2>
        <div className={styles.subTitle}>
          <span>Transactions</span>
        </div>
        <div className={styles.transactions}>
          {_transactions.map((i, index) => {
            return (
              <Transaction
                key={index}
                link={`${config.blockExplorerUrl}/transaction/${i.txhash}`}
                title={truncate(i.txhash, 10, 4, '...')}
                subTitle={moment.unix(i.block.timestamp).format('lll')}
                status={calculateOutput(i)}
                subStatus={`Block ${i.block.blknum}`}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.section}>
        <Input
          icon
          placeholder='Search history'
          value={searchHistory}
          onChange={i => setSearchHistory(i.target.value)}
          className={styles.searchBar}
        />
        <div className={styles.subTitle}>
          <span>Exits</span>
        </div>
        <div className={styles.transactions}>
          {_processableExits.map((i, index) => {
            return (
              <Transaction
                key={index}
                link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                button={{
                  onClick: () => setProcessExitModal(i),
                  text: 'Process Exit'
                }}
                title={truncate(i.transactionHash, 10, 4, '...')}
                subTitle={`Block ${i.blockNumber}`}
              />
            );
          })}
          {_pendingExits.map((i, index) => {
            return (
              <Transaction
                key={index}
                link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
                status='Pending'
                subStatus={`Eligible to exit on ${moment.unix(i.scheduledFinalizationTime).format('lll')}`}
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
  );
}

export default Transactions;
