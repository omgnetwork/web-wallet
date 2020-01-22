import React from 'react';

import * as styles from './Button.module.scss';

function Button ({ children, style, onClick, type, disabled }) {
  return (
    <div
      style={style}
      className={[
        styles.Button,
        type === 'primary' ? styles.primary : '',
        type === 'secondary' ? styles.secondary : '',
        type === 'outline' ? styles.outline : '',
        disabled ? styles.disabled : ''
      ].join(' ')}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

export default Button;
