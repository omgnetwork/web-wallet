import React from 'react';

import * as styles from './Tabs.module.scss';

function Tabs ({ tabs, activeTab, onClick, className }) {
  return (
    <div className={[styles.Tabs, className].join(' ')}>
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
