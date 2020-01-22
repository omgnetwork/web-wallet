import React from 'react';

import * as styles from './Tabs.module.scss';

function Tabs ({ tabs, activeTab, onClick }) {
  return (
    <div className={styles.Tabs}>
      {tabs.map((i, index) => {
        return (
          <div
            key={index}
            onClick={() => onClick(i)}
            className={[
              styles.tab,
              activeTab === i ? styles.active : ''
            ].join(' ')}
          >
            {i}
          </div>
        )
      })}
    </div>
  );
}

export default Tabs;
