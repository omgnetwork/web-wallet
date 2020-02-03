import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  const errors = useSelector(selectAllErrors());

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
    checkNetwork()
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
  }, [errors, dispatch]);

  function renderLoading () {
    return (
      <div className={styles.loading}>
        <img src='omg_logo.svg' alt='logo' />
        <span>Waiting for Web3...</span>
        <span>{`Please make sure you are on the ${capitalize(config.network)} network.`}</span>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      {loading
        ? renderLoading()
        : <Home />
      }

      <Alert
        type='error'
        duration={5000}
        open={isError}
        onClose={() => dispatch(clearError(error))}
      >
        {`Oops! Something went wrong! ${isError ? Object.values(error)[0] : ''}`}
      </Alert>
    </div>
  );
}

export default App;
