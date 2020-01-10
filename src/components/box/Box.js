import React from 'react';

import * as styles from './Box.module.scss';

function Box ({ children }) {
  return (
    <div className={styles.Box}>
      {children}
    </div>
  )
}

export default Box;
