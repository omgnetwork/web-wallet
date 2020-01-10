import React, { useState, useEffect } from 'react';
import truncate from 'truncate-middle';

import Box from 'components/box/Box';
import Info from 'components/info/Info';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account () {
  const [ accounts, setAccounts ] = useState([]);

  useEffect(() => {
    async function fetchAccounts() {
      const accounts = await networkService.getAccounts();
      setAccounts(accounts);
    }
    fetchAccounts();
  }, []);

  return (
    <Box>
      <h2>Account Information</h2>
      <Info
        data={[
          {
            title: 'Wallet Address',
            value: accounts[0] ? truncate(accounts[0], 6, 4, '...') : ''
          },
          {
            title: 'Rootchain ETH Balance',
            value: 120120
          },
          {
            title: 'Childchain ETH Balance',
            value: 52
          }
        ]}
      />
    </Box>
  );
}

export default Account;
