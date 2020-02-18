import React from 'react';
import { Tooltip } from '@material-ui/core';

import * as styles from './Transaction.module.scss';

function Transaction ({
  link,
  status,
  statusPercentage,
  subStatus,
  button,
  title,
  midTitle,
  subTitle,
  tooltip = ''
}) {
  function renderValue () {
    if (button) {
      return (
        <div className={styles.statusContainer}>
          <div
            onClick={button.onClick}
            className={styles.button}
          >
            {button.text}
          </div>
          <div>{subStatus}</div>
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
            ].join(' ')}
          />
            <span>{status}</span>
            {status === 'Pending' && statusPercentage && (
              <Tooltip
                title={tooltip}
                arrow
              >
                <span className={styles.percentage}>{`(${Math.max(statusPercentage, 0)}%)`}</span>
              </Tooltip>
            )}
        </div>
        <div>{subStatus}</div>
      </div>
    );
  }

  const Resolved = link ? 'a' : 'div';
  return (
    <div className={styles.Transaction}>
      <Resolved
        href={link}
        target={'_blank'}
        rel='noopener noreferrer'
        className={styles.left}
      >
        <div>{title}</div>
        {midTitle && (
          <div className={styles.midTitle}>{midTitle}</div>
        )}
        <div>{subTitle}</div>
      </Resolved>
      <div className={styles.right}>
        {renderValue()} 
      </div>
    </div>
  );
}

export default Transaction;
