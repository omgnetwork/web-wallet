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

import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector, batch } from 'react-redux';
import { uniq, flatten, isEqual } from 'lodash';

import { selectModalState } from 'selectors/uiSelector';
import { selectChildchainTransactions } from 'selectors/transactionSelector';
import config from 'util/config';
import useInterval from 'util/useInterval';
import {
  checkWatcherStatus,
  fetchBalances,
  fetchTransactions,
  fetchExits,
  fetchDeposits,
  getExitQueue,
  fetchFees,
  fetchGas
} from 'actions/networkAction';

import DepositModal from 'containers/modals/deposit/DepositModal';
import TransferModal from 'containers/modals/transfer/TransferModal';
import ExitModal from 'containers/modals/exit/ExitModal';
import MergeModal from 'containers/modals/merge/MergeModal';

import Status from 'containers/status/Status';
import Account from 'containers/account/Account';
import Transactions from 'containers/transactions/Transactions';

import MobileHeader from 'components/mobileheader/MobileHeader';
import MobileMenu from 'components/mobilemenu/MobileMenu';

import logo from 'images/omg_logo.svg';
import * as styles from './Home.module.scss';

const POLL_INTERVAL = config.pollInterval * 1000;

function Home () {
  const dispatch = useDispatch();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [ mobileMenuOpen, setMobileMenuOpen ] = useState(false);
  const depositModalState = useSelector(selectModalState('depositModal'));
  const transferModalState = useSelector(selectModalState('transferModal'));
  const exitModalState = useSelector(selectModalState('exitModal'));
  const mergeModalState = useSelector(selectModalState('mergeModal'));

  const transactions = useSelector(selectChildchainTransactions, isEqual);
  const transactedTokens = useMemo(() => {
    const inputs = flatten(transactions
      .filter(i => i.status !== 'Pending')
      .map(i => i.inputs)
    );
    return uniq(inputs.map(i => i.currency));
  }, [ transactions ]);

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0];
    mobileMenuOpen
      ? body.style.overflow = 'hidden'
      : body.style.overflow = 'auto';
  }, [ mobileMenuOpen ]);

  useInterval(() => {
    batch(() => {
      dispatch(checkWatcherStatus());
      dispatch(fetchBalances());
      dispatch(fetchDeposits());
      dispatch(fetchExits());
      dispatch(fetchTransactions());
      dispatch(fetchFees());
  
      for (const token of transactedTokens) {
        dispatch(getExitQueue(token));
      }
    });
  }, POLL_INTERVAL);

  useInterval(() => {
    dispatch(fetchGas());
  }, POLL_INTERVAL * 10);

  return (
    <>
      <DepositModal open={depositModalState} />
      <TransferModal open={transferModalState} />
      <ExitModal open={exitModalState} />
      <MergeModal open={mergeModalState} />

      <div className={styles.Home}>
        <div className={styles.sidebar}>
          <img className={styles.logo} src={logo} alt='omg-network' />
          <Status />
        </div>
        <div className={styles.main}>
          <MobileHeader
            mobileMenuOpen={mobileMenuOpen}
            onHamburgerClick={() => setMobileMenuOpen(open => !open)}
          />
          <MobileMenu mobileMenuOpen={mobileMenuOpen} />
          <Account/>
          <Transactions/>
        </div>
      </div>
    </>
  );
}

export default React.memo(Home);
