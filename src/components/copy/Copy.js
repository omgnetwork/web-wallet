import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FileCopyOutlined } from '@material-ui/icons';
import { Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

import * as styles from './Copy.module.scss';

function Copy ({ value }) {
  const [ open, setOpen ] = useState(false);
  
  function Alert (props) {
    return <MuiAlert elevation={6} variant='filled' {...props} />;
  }

  return (
    <>
      <CopyToClipboard
        text={value}
        onCopy={() => setOpen(true)}
      >
        <div className={styles.Copy}>
          <FileCopyOutlined />
        </div>
      </CopyToClipboard>
      <Snackbar
        open={open}
        autoHideDuration={3000}
        onClose={() => setOpen(false)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center'
        }}
      >
        <Alert onClose={() => setOpen(false)} severity="success">
          Copied to clipboard! 
        </Alert>
      </Snackbar>
    </>
  );
}

export default Copy;
