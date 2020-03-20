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

import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { forOwn, capitalize } from 'lodash';

import { clearError } from 'actions/errorAction';
import networkService from 'services/networkService';
import { selectAllErrors } from 'selectors/errorSelector';

import Home from 'containers/home/Home';
import Alert from 'components/alert/Alert';
import config from 'util/config';

import * as styles from './App.module.scss';

function App () {
  const dispatch = useDispatch();
  const errors = useSelector(selectAllErrors, shallowEqual);

  const [ loading, setLoading ] = useState(true);
  const [ error, setError ] = useState({});
  const [ isError, setIsError ] = useState(false);

  useEffect(() => {
    async function checkNetwork() {
      const networkEnabled = await networkService.enableNetwork();
      if (networkEnabled) {
        setLoading(false);
      }
    }
    checkNetwork();
  }, []);

  useEffect(() => {
    forOwn(errors, function(value, key) {
      if (!!value) {
        setError({ [key]: value });
        setIsError(true);
      } else {
        setError({});
        setIsError(false);
      }
    })
  }, [errors]);

  const handleErrorClose = useCallback(
    () => dispatch(clearError(error)),
    [dispatch, error]
  );

  const renderLoading = (
    <div className={styles.loading}>
      <img src='omisego-blue.svg' alt='logo' />
      <span>Waiting for Web3...</span>
      <span>{`Please make sure you are on the ${capitalize(config.network)} network.`}</span>
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
        open={isError}
        onClose={handleErrorClose}
      >
        {`Oops! Something went wrong! ${isError ? Object.values(error)[0] : ''}`}
      </Alert>
    </div>
  );
}

export default App;
