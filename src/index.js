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

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/browser';
import TagManager from 'react-gtm-module';

import networkService from 'services/networkService';
import config from 'util/config';
import store from 'store';

import App from 'containers/app/App';

import './index.scss';

if (config.sentry) {
  Sentry.init({ dsn: config.sentry });
}
if (config.gtmId) {
  TagManager.initialize({ gtmId: config.gtmId });
}

try {
  window.ethereum.on('accountsChanged', function (accounts) {
    if (
      networkService.account
      && networkService.account.toLowerCase() !== accounts[0].toLowerCase()
    ) {
      window.location.reload(false);
    }
  });
} catch (err) {
  console.warn('web3 event handling not available on this browser')
}

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
