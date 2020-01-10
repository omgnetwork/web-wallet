import React from 'react';
import { Button } from '@material-ui/core';

import Box from 'components/box/Box';

import * as styles from './Actions.module.scss';

function Actions ({ watcherConnection }) {
  return (
    <Box>
      <div className={styles.Actions}>
        <Button variant='outlined' color='primary'>
          Deposit
        </Button>
        {watcherConnection && (
          <>
            <Button variant='outlined' color='primary'>
              Transfer
            </Button>
            <Button variant='outlined' color='primary'>
              Exit
            </Button>
          </>
        )}
        <Button variant='outlined' color='primary'>
          Process Exits
        </Button>
      </div>
    </Box>
  );
}

export default Actions;
