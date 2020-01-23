import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { FileCopyOutlined } from '@material-ui/icons';

import Alert from 'components/alert/Alert';

import * as styles from './Copy.module.scss';

function Copy ({ value, light }) {
  const [ open, setOpen ] = useState(false);

  return (
    <div className={styles.Copy}>
      <CopyToClipboard
        text={value}
        onCopy={() => setOpen(true)}
      >
        <div
          className={[
            styles.icon,
            light ? styles.light : ''
          ].join(' ')}>
          <FileCopyOutlined />
        </div>
      </CopyToClipboard>
      <Alert open={open} onClose={() => setOpen(false)}>
        Copied to clipboard! 
      </Alert>
    </div>
  );
}

export default Copy;
