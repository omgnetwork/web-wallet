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

import React, { useState, useEffect } from 'react';
import { orderBy, isEqual } from 'lodash';
import { useSelector } from 'react-redux';
import truncate from 'truncate-middle';

import { selectEthDeposits, selectErc20Deposits } from 'selectors/transactionSelector';
import { selectLoading } from 'selectors/loadingSelector';

import Transaction from 'components/transaction/Transaction';
import Pager from 'components/pager/Pager';

import config from 'util/config';
import { logAmount } from 'util/amountConvert';

import * as styles from './Transactions.module.scss';

const PER_PAGE = 10;

function Deposits ({ searchHistory }) {
  const [ page, setPage ] = useState(1);

  const ethDeposits = useSelector(selectEthDeposits, isEqual);
  const erc20Deposits = useSelector(selectErc20Deposits, isEqual);
  const loading = useSelector(selectLoading([ 'DEPOSIT/GETALL' ]));

  useEffect(() => {
    setPage(1);
  }, [ searchHistory ]);

  const deposits = orderBy(
    [ ...ethDeposits, ...erc20Deposits ],
    i => i.blockNumber, 'desc'
  );
  const _deposits = deposits.filter(i => {
    return i.transactionHash.includes(searchHistory) || i.returnValues.token.includes(searchHistory);
  });

  const startingIndex = page === 1 ? 0 : ((page - 1) * PER_PAGE);
  const endingIndex = page * PER_PAGE;
  const paginatedDeposits = _deposits.slice(startingIndex, endingIndex);

  return (
    <div className={styles.transactionSection}>
      <div className={styles.transactions}>
        <Pager
          currentPage={page}
          isLastPage={paginatedDeposits.length < PER_PAGE}
          onClickNext={() => setPage(page + 1)}
          onClickBack={() => setPage(page - 1)}
        />
        {!paginatedDeposits.length && !loading && (
          <div className={styles.disclaimer}>No deposit history.</div>
        )}
        {!paginatedDeposits.length && loading && (
          <div className={styles.disclaimer}>Loading...</div>
        )}
        {paginatedDeposits.map((i, index) => {
          return (
            <Transaction
              key={index}
              link={`${config.etherscanUrl}/tx/${i.transactionHash}`}
              title={truncate(i.transactionHash, 6, 4, '...')}
              midTitle='Deposit'
              subTitle={`Token: ${i.tokenInfo.name}`}
              status={i.status === 'Pending' ? 'Pending' : logAmount(i.returnValues.amount, i.tokenInfo.decimals)}
              statusPercentage={i.pendingPercentage <= 100 ? i.pendingPercentage : ''}
              subStatus={`Block ${i.blockNumber}`}
              tooltip={'For re-org protection, deposits require 10 block confirmations before the UTXO is available to spend.'}
            />
          );
        })}
      </div>
    </div>
  );
}

export default React.memo(Deposits);
