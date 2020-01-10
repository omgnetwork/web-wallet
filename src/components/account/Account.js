import React, { useState, useEffect } from 'react';
import truncate from 'truncate-middle';

import Box from 'components/box/Box';
import Info from 'components/info/Info';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account () {
  const [ account, setAccount ] = useState([]);
  const [ rootBalance, setRootBalance ] = useState([]);
  const [ childBalance, setChildBalance ] = useState([]);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    async function initAccounts() {
      const accounts = await networkService.getAccounts();
      setAccount(accounts[0]);
      await fetchBalances(accounts[0]);
      setLoading(false);
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
          value: Math.round(Number(i.amount)*10000)/10000
        }
      });
      return [...seperator, ...balances];
    }
    return [{
      title: 'Childchain Balance',
      value: 'None'
    }]
  }

  function renderRootchainBalances () {
    if (rootBalance.length) {
      return rootBalance.map(i => {
        return {
          title: `Rootchain ${i.currency} Balance`,
          value: Math.round(Number(i.amount)*10000)/10000
        }
      })
    }
    return []
  }

  return (
    <Box>
      <h2>Account Information</h2>
      <Info
        loading={loading}
        data={[
          {
            title: 'Wallet Address',
            value: account ? truncate(account, 6, 4, '...') : ''
          },
          ...renderRootchainBalances(),
          ...renderChildchainBalances()
        ]}
      />
    </Box>
  );
}

export default Account;
