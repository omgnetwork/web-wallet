import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import * as Sentry from '@sentry/browser';

import App from 'containers/app/App';
import store from 'store';

import './index.scss';

Sentry.init({
  dsn: 'https://631acdc5818b4216905974e5490515e2@sentry.io/2732241'
});

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
