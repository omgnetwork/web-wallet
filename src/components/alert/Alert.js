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
      autoHideDuration={duration}
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
