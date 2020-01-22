import React from 'react';
import { CircularProgress } from '@material-ui/core';

import * as styles from './Button.module.scss';

function Button ({ children, style, onClick, type, disabled, loading }) {
  return (
    <div
      style={style}
      className={[
        styles.Button,
        type === 'primary' ? styles.primary : '',
        type === 'secondary' ? styles.secondary : '',
        type === 'outline' ? styles.outline : '',
        disabled ? styles.disabled : '',
        loading ? styles.disabled : ''
      ].join(' ')}
      onClick={onClick}
    >
      {children}
      {loading && (
        <div className={styles.loading}>
          <CircularProgress size={14} color='inherit' />
        </div>
      )}
    </div>
  )
}

export default Button;
