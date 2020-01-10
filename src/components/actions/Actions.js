import React, { useState } from 'react';
import { Button } from '@material-ui/core';

import Box from 'components/box/Box';
import DepositModal from './modals/DepositModal';
import TransferModal from './modals/TransferModal';
import ExitModal from './modals/ExitModal';
import ProcessExitsModal from './modals/ProcessExitsModal';

import * as styles from './Actions.module.scss';

function Actions ({ watcherConnection }) {
  const [ depositModal, setDepositModal ] = useState(false);
  const [ transferModal, setTransferModal ] = useState(false);
  const [ exitModal, setExitModal ] = useState(false);
  const [ processExitsModal, setProcessExitsModal ] = useState(false);

  return (
    <>
      <DepositModal open={depositModal} toggle={() => setDepositModal(false)} />
      <TransferModal open={transferModal} toggle={() => setTransferModal(false)} />

      {/* <ExitModal open={exitModal} toggle={() => setExitModal(false)} /> */}
      {/* <ProcessExitsModal open={processExitsModal} toggle={() => setProcessExitsModal(false)} /> */}

      <Box>
        <div className={styles.Actions}>
          <Button
            onClick={() => setDepositModal(true)} 
            variant='outlined'
            color='primary'
          >
            Deposit
          </Button>

          {watcherConnection && (
            <>
              <Button
                onClick={() => setTransferModal(true)} 
                variant='outlined'
                color='primary'
              >
                Transfer
              </Button>
              <Button
                onClick={() => setExitModal(true)}
                variant='outlined'
                color='primary'
              >
                Exit
              </Button>
            </>
          )}
          <Button
            onClick={() => setProcessExitsModal(true)} 
            variant='outlined'
            color='primary'
          >
            Process Exits
          </Button>
        </div>
      </Box>
    </>
  );
}

export default Actions;
