import React, { useState, useEffect } from 'react';
import moment from 'moment';

import networkService from 'services/networkService';
import Box from 'components/box/Box';
import Info from 'components/info/Info';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection }) {
  const [ loading, setLoading ] = useState(true);
  const [ transactions, setTransactions ] = useState([]);

  useEffect(() => {
    async function fetchTransactions () {
      const transactions = await networkService.childChain.getTransactions({ address: networkService.account });
      setTransactions(transactions);
      console.log(transactions);
      setLoading(false);
    }
    if (watcherConnection) {
      fetchTransactions();
    }
  }, [watcherConnection])

  return (
    <Box>
      <h2>Transactions</h2>
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className={styles.Transactions}>
          {!transactions.length && <div>No transaction history for this account. Transfer some funds on the OMG Network using the buttons at the top.</div>}
          {transactions.map(i => {
            return (
              <div key={i.txhash} className={styles.transaction}>
                <Info
                  data={[
                    {
                      title: 'Timestamp',
                      value: moment.unix(i.block.timestamp).format('lll')
                    },
                    {
                      title: 'Block number',
                      value: i.block.blknum
                    },
                    {
                      title: 'Transaction hash',
                      value: i.txhash
                    }
                  ]}
                />
              </div>
            )
          })}
        </div>
      )}
    </Box>
  );
}

export default Transactions;
