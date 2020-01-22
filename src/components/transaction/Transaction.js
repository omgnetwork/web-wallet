import React from 'react';

import * as styles from './Transaction.module.scss';

function Transaction ({ status, subStatus, button, title, subTitle }) {

  function renderValue () {
    if (button) {
      return (
        <div
          onClick={button.onClick}
          className={styles.button}
        >
          {button.text}
        </div>
      );
    }
    return (
      <div className={styles.statusContainer}>
        <div className={styles.status}>
          <div
            className={[
              styles.indicator,
              status === 'Pending' ? styles.pending : '',
              status === 'Exited' ? styles.exited : '',
              status === 'Failed' ? styles.failed : ''
            ].join(' ')} />
          <span>{status}</span>
        </div>
        <div>{subStatus}</div>
      </div>
    );
  }

  return (
    <div className={styles.Transaction}>
      <div className={styles.left}>
        <div>{title}</div>
        <div>{subTitle}</div>
      </div>
      <div className={styles.right}>
        {renderValue()} 
      </div>
    </div>
  );
}

export default Transaction;
