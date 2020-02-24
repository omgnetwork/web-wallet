import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/browser';

import App from 'containers/app/App';
import config from 'util/config';
import store from 'store';

import './index.scss';

Sentry.init({ dsn: config.sentry });

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
