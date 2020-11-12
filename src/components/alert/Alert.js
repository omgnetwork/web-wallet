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
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

function _Alert ({ children, open, onClose, type = 'success', duration = 3000 }) {
  function Alert (props) {
    return <MuiAlert elevation={6} variant='filled' {...props} />;
  }

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration ? duration : undefined}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center'
      }}
    >
      <Alert onClose={onClose} severity={type}>
        {children}
      </Alert>
    </Snackbar>
  );
}

export default _Alert;
