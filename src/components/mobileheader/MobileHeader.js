import React from 'react';

import logo from 'images/omg_logo.svg';

import * as styles from './MobileHeader.module.scss';

function MobileHeader () {
  return (
    <div className={styles.MobileHeader}>
      <img className={styles.logo} src={logo} alt='omg-network' />
    </div>
  );
}

export default MobileHeader;
