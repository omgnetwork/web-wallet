import React from 'react';

import * as styles from './Info.module.scss';

function Info ({ data, loading }) {
  if (loading) {
    return <div>Loading...</div>
  }
  return (
    <div className={styles.Info}>
      {data.map((i, index) => (
        <div key={index} className={styles.item}>
          <span>{i.title}</span>
          <span>{i.value}</span>
        </div>
      ))}
    </div>
  );
}

export default Info;
