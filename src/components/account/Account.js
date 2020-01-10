import React, { useState, useEffect } from 'react';
import truncate from 'truncate-middle';

import Box from 'components/box/Box';
import Info from 'components/info/Info';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account () {
  const [ account, setAccount ] = useState([]);
  const [ rootBalance, setRootBalance ] = useState({});
  const [ childBalance, setChildBalance ] = useState([]);

  useEffect(() => {
    async function initAccounts() {
      const accounts = await networkService.getAccounts();
      setAccount(accounts[0]);
      fetchBalances(accounts[0]);
    }
    initAccounts();
  }, []);

  async function fetchBalances (account) {
    const balances = await networkService.getBalances(account);
    setRootBalance(balances.rootchain);
    setChildBalance(balances.childchain);
  }

  function renderChildchainBalances () {
    if (childBalance.length) {
      const seperator = [
        {
          title: '----',
          value: ''
        }
      ];
      const balances = childBalance.map(i => {
        return {
          title: `Childchain ${i.currency} Balance`,
          value: i.amount
        }
      });
      return [...seperator, ...balances];
    }
    return [{
      title: 'Childchain Balance',
      value: 'None'
    }]
  }

  return (
    <Box>
      <h2>Account Information</h2>
      <Info
        data={[
          {
            title: 'Wallet Address',
            value: account ? truncate(account, 6, 4, '...') : ''
          },
          {
            title: 'Rootchain ETH Balance',
            value: rootBalance.currency ? `${Number(rootBalance.amount).toFixed(4)} ${rootBalance.currency}` : '0 ETH'
          },
          ...renderChildchainBalances()
        ]}
      />
    </Box>
  );
}

export default Account;
