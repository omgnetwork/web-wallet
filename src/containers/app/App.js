import React, { useState, useEffect } from 'react';

import networkService from 'services/networkService';
import Home from 'containers/home/Home';

import * as styles from './App.module.scss';

function App () {
  const [ loading, setLoading ] = useState(true);

  useEffect(() => {
    async function checkNetwork() {
      const networkEnabled = await networkService.enableNetwork();
      if (networkEnabled) {
        setLoading(false);
      }
    }
    checkNetwork()
  }, []);

  function renderLoading () {
    return (
      <div className={styles.loading}>
        <img src='omg_logo.svg' alt='logo' />
        <span>Waiting for Web3...</span>
      </div>
    );
  }

  return (
    <div className={styles.App}>
      {loading
        ? renderLoading()
        : <Home />
      }
    </div>
  );
}

export default App;
