import React, { useState, useEffect } from 'react';

import Box from 'components/box/Box';

import * as styles from './Transactions.module.scss';

function Transactions ({ watcherConnection }) {
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    async function fetchTransactions () {
      setLoading(false);
    }
    if (watcherConnection) {
      fetchTransactions()
    }
  }, [watcherConnection])

  return (
    <Box>
      <h2>Transactions</h2>
      {loading && <div>Loading...</div>}
      {!loading && (
        <div className={styles.Transactions}>
          TOTO
        </div>
      )}
    </Box>
  );
}

export default Transactions;
