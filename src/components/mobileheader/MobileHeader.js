import React, { useState } from 'react';

import logo from 'images/omg_logo.svg';

import Hamburger from 'components/hamburger/Hamburger';
import Status from 'containers/status/Status';
import * as styles from './MobileHeader.module.scss';

function MobileHeader () {
  const [ isOpen, setIsOpen ] = useState(false);

  function handleHamburgerClick () {
    setIsOpen(!isOpen);
    if (isOpen) {
      window.scrollTo(0,0);
    }
  }

  return (
    <div
      className={[
        styles.Container,
        isOpen ? styles.open : ''
      ].join(' ')}
    >
      <div className={styles.MobileHeader}>
        <img className={styles.logo} src={logo} alt='omg-network' />
        <Hamburger
          hamburgerClick={handleHamburgerClick}
          isOpen={isOpen}
        />
      </div>
      <Status className={styles.menu} />
    </div>
  );
}

export default MobileHeader;
