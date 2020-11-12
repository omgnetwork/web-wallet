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

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { closeAlert, closeError } from 'actions/uiAction';
import { selectAlert, selectError } from 'selectors/uiSelector';

import Home from 'containers/home/Home';
import WalletPicker from 'components/walletpicker/WalletPicker';
import Alert from 'components/alert/Alert';

import * as styles from './App.module.scss';

function App () {
  const dispatch = useDispatch();

  const errorMessage = useSelector(selectError);
  const alertMessage = useSelector(selectAlert);
  const [ enabled, setEnabled ] = useState(false);

  const handleErrorClose = () => dispatch(closeError());
  const handleAlertClose = () => dispatch(closeAlert());

  return (
    <div className={styles.App}>
      <Alert
        type='error'
        duration={0}
        open={!!errorMessage}
        onClose={handleErrorClose}
      >
        {errorMessage}
      </Alert>

      <Alert
        type='success'
        duration={0}
        open={!!alertMessage}
        onClose={handleAlertClose}
      >
        {alertMessage}
      </Alert>

      {!enabled && <WalletPicker onEnable={setEnabled} />}
      {enabled && <Home />}
    </div>
  );
}

export default App;
