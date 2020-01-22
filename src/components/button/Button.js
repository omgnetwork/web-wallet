import React from 'react';

import * as styles from './Button.module.scss';

function Button ({ children, onClick, type, disabled }) {
  return (
    <div
      className={[
        styles.Button,
        type === 'primary' ? styles.primary : '',
        type === 'secondary' ? styles.secondary : '',
        disabled ? styles.disabled : ''
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Button;
