import React from 'react';
import truncate from 'truncate-middle';

import Info from 'components/info/Info';

import networkService from 'services/networkService';

import * as styles from './Account.module.scss';

function Account ({ className, childBalance = [], rootBalance = [] }) {
  function renderChildchainBalances () {
    if (childBalance.length) {
      return childBalance.map(i => {
        return {
          title: `OMG Network ${i.symbol} Balance`,
          value: Math.round(Number(i.amount)*10000)/10000
        }
      });
    }
    if (rootBalance.length) {
      return [{
        title: 'OMG Network Balance',
        value: 'None'
      }]
    }
    return [{
      title: 'Balances',
      value: 'Loading...'
    }]
  }

  function renderRootchainBalances () {
    if (rootBalance.length) {
      return rootBalance.map(i => {
        return {
          title: `Rootchain ${i.symbol} Balance`,
          value: Math.round(Number(i.amount)*10000)/10000
        }
      })
    }
    return []
  }

  return (
    <div className={className}>
      <h2>Account</h2>
      <Info
        data={[
          {
            title: 'Wallet Address',
            value: networkService.account ? truncate(networkService.account, 6, 4, '...') : ''
          },
          ...renderRootchainBalances(),
          ...renderChildchainBalances()
        ]}
      />
    </div>
  );
}

export default Account;
