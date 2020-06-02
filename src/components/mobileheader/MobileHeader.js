import React from 'react';

import logo from 'images/omg_logo.svg';

import Hamburger from 'components/hamburger/Hamburger';
import * as styles from './MobileHeader.module.scss';

function MobileHeader ({ mobileMenuOpen, onHamburgerClick }) {
  return (
    <div className={styles.MobileHeader}>
      <img className={styles.logo} src={logo} alt='omg-network' />
      <Hamburger
        hamburgerClick={onHamburgerClick}
        isOpen={mobileMenuOpen}
      />
    </div>
  );
}

export default MobileHeader;
