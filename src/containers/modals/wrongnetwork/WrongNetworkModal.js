/*
Copyright 2019-present OmiseGO Pte Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License. */

import React from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'components/modal/Modal';
import { closeModal } from 'actions/uiAction';
import { getNetworkName, getOtherNetworks } from 'util/networkName';
import close from 'images/close.png';
import arrow from 'images/arrow.png';

import * as styles from './WrongNetworkModal.module.scss';

function WrongNetworkModal ({ open, onClose }) {
  const dispatch = useDispatch();

  function handleClose () {
    onClose();
    dispatch(closeModal('wrongNetworkModal'));
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      light
    >
      <div className={styles.WrongNetworkModal}>
        <img
          className={styles.close}
          onClick={handleClose}
          src={close}
          alt='close'
        />
        <h2>Wrong Network</h2>

        <div className={styles.content}>
          <div className={styles.description}>
            Please switch your wallet to the {getNetworkName()} in order to continue.
          </div>

          <div className={styles.currentNetwork}>
            <div
              className={[
                styles.indicator,
                styles.active
              ].join(' ')}
            />
            <span>{getNetworkName()}</span>
          </div>

          <img
            className={styles.arrow}
            src={arrow}
            alt='arrow'
          />

          <div className={styles.otherNetworks}>
            {getOtherNetworks().map((network, index) => {
              return (
                <div key={index} className={styles.network}>
                  <div className={styles.indicator} />
                  <span>{network}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default React.memo(WrongNetworkModal);
