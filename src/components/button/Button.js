import React from 'react';
import { CircularProgress, Tooltip } from '@material-ui/core';

import * as styles from './Button.module.scss';

function Button ({
  children,
  style,
  onClick,
  type,
  disabled,
  loading,
  tooltip = ''
}) {
  return (
    <div
      style={style}
      className={[
        styles.Button,
        type === 'primary' ? styles.primary : '',
        type === 'secondary' ? styles.secondary : '',
        type === 'outline' ? styles.outline : '',
        loading ? styles.disabled : '',
        disabled ? styles.disabled : '',
      ].join(' ')}
      onClick={onClick}
    >
      {children}
      {loading && (
        <Tooltip
          title={tooltip}
          arrow
        >
          <div className={styles.loading}>
            <CircularProgress size={14} color='inherit' />
          </div>
        </Tooltip>
      )}
    </div>
  )
}

export default Button;
