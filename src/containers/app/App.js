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
import { useDispatch, useSelector } from 'react-redux';
import { capitalize } from 'lodash';

import { closeAlert, closeError } from 'actions/uiAction';
import { selectAlert, selectError } from 'selectors/uiSelector';
import networkService from 'services/networkService';

import Home from 'containers/home/Home';
import Alert from 'components/alert/Alert';
import config from 'util/config';

import logo from 'images/omg_logo.svg';

import * as styles from './App.module.scss';

function App () {
  const dispatch = useDispatch();

  const errorMessage = useSelector(selectError);
  const alertMessage = useSelector(selectAlert);
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    async function checkNetwork () {
      const networkEnabled = await networkService.enableNetwork();
      if (networkEnabled) {
        setLoading(false);
      }
    }
    checkNetwork();
  }, []);

  const handleErrorClose = () => dispatch(closeError());
  const handleAlertClose = () => dispatch(closeAlert());

  function getNetworkName () {
    if (config.network === 'main') {
      return 'Main Ethereum';
    }
    return `${capitalize(config.network)} Test`;
  }

  const renderLoading = (
    <div className={styles.loading}>
      <img src={logo} alt='logo' />
      <span>Waiting for wallet...</span>
      <span>{`Please make sure your wallet is set to the ${getNetworkName()} Network.`}</span>
    </div>
  );

  return (
    <div className={styles.App}>
      {loading
        ? renderLoading
        : <Home />
      }

      <Alert
        type='error'
        duration={5000}
        open={!!errorMessage}
        onClose={handleErrorClose}
      >
        {`Error! ${errorMessage}`}
      </Alert>

      <Alert
        type='success'
        duration={20000}
        open={!!alertMessage}
        onClose={handleAlertClose}
      >
        {alertMessage}
      </Alert>
    </div>
  );
}

export default App;
