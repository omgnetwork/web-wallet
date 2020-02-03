import React from 'react';
import { orderBy } from 'lodash';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';

import { selectEthDeposits, selectErc20Deposits } from 'selectors/transactionSelector';

import Transaction from 'components/transaction/Transaction';
import config from 'util/config';

import * as styles from './Transactions.module.scss';

function Deposits ({ searchHistory }) {
  const ethDeposits = useSelector(selectEthDeposits);
  const erc20Deposits = useSelector(selectErc20Deposits);

  const deposits = orderBy(
    [...ethDeposits, ...erc20Deposits],
    i => i.blockNumber, 'desc'
  );
  const _deposits = deposits.filter(i => {
    return i.transactionHash.includes(searchHistory) || i.returnValues.token.includes(searchHistory);
  });

  return (
    <div className={styles.transactionSection}>
      <div className={styles.transactions}>
        {!_deposits.length && (
          <div className={styles.disclaimer}>No deposit history.</div>
        )}
        {_deposits.map((i, index) => {
          return (
            <Transaction
              key={index}
              link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
              title={truncate(i.transactionHash, 10, 4, '...')}
              subTitle={`Token: ${truncate(i.returnValues.token, 10, 4, '...')}`}
              status={i.status === 'Pending' ? 'Pending' : `${i.returnValues.amount}`}
              statusPercentage={i.pendingPercentage <= 100 ? i.pendingPercentage : ''}
              subStatus={`Block ${i.blockNumber}`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Deposits;
