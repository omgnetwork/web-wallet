import React, { useState, useEffect } from 'react';
import { OmgUtil } from '@omisego/omg-js';
import { makeStyles } from '@material-ui/core/styles';
import {
  Button,
  Modal,
  Backdrop,
  Fade,
  CircularProgress,
  TextField,
  Switch
} from '@material-ui/core';
import networkService from 'services/networkService';

const useStyles = makeStyles({
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    outline: 'none'
  },
  paper: {
    backgroundColor: '#1f2a38',
    width: '80%',
    padding: '20px',
    border: 'none',
    outline: 'none'
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row'
  },
  button: {
    flex: 1,
    margin: '10px 5px 0 5px'
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  input: {
    display: 'flex',
    flex: 1,
    backgroundColor: '#0a1320',
    borderRadius: '5px',
    margin: '10px 0'
  },
  inputRow: {
    display: 'flex',
    flexDirection: 'column',
    margin: '20px 0'
  },
  inputText: {
    color: 'white'
  }
});

function DepositModal ({ open, toggle }) {
  const classes = useStyles();
  const [ loading, setLoading ] = useState(false);
  const [ value, setValue ] = useState(1);
  const [ currency, setCurrency ] = useState(OmgUtil.transaction.ETH_CURRENCY);
  const [ isEth, setEth ] = useState(true);
  const [ success, setSuccess ] = useState(false);

  useEffect(() => {
    if (isEth) {
      setCurrency(OmgUtil.transaction.ETH_CURRENCY);
    } else {
      setCurrency('');
    }
  }, [ isEth ])

  async function submit () {
    if (value && currency) {
      setLoading(true);
      try {
        await networkService.deposit(value, currency);
        setLoading(false);
        setSuccess(true);
      } catch (err) {
        console.warn(err);
        handleClose()
      }
    }
  }

  function handleClose () {
    toggle();
    setSuccess(false);
    setLoading(false);
  }

  return (
    <Modal
      aria-labelledby='transition-modal-title'
      aria-describedby='transition-modal-description'
      className={classes.modal}
      open={open}
      onClose={!loading ? handleClose : () => {}}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          {!!loading && (
            <div className={classes.loading}>
              <h2>Loading</h2>
              <CircularProgress />
            </div>
          )}
          {!!success && (
            <div className={classes.loading}>
              <h2>Success</h2>
              <div>Deposit successful. Your OMG Network balance will be updated shortly.</div>
              <Button
                className={classes.button}
                onClick={handleClose}
                variant='contained'
                color='primary'
              >
                Close
              </Button>
            </div>
          )}
          {!loading && !success && (
            <>
              <h2>{`Deposit ${isEth ? 'ETH' : 'ERC20'} into the OMG Network`}</h2>
              <div className={classes.inputRow}>
                <div>
                  <Switch
                    className={classes.switch}
                    color='primary'
                    checked={isEth}
                    onChange={() => setEth(!isEth)}
                    value={true}
                  />
                  <span>ETH</span>
                </div>
                {!isEth && <div>You will be prompted with 2 confirmations. The first is to approve the deposit, and the second will be the actual deposit transaction.</div>}
                {!isEth && (
                  <TextField
                    className={classes.input}
                    InputProps={{
                      className: classes.inputText,
                    }}
                    InputLabelProps={{
                      focused: true
                    }}
                    id='filled-basic'
                    label='ERC20 Address'
                    type='numbertext'
                    variant='filled'
                    value={currency}
                    onChange={i => setCurrency(i.target.value)}
                  />
                )}
                <TextField
                  className={classes.input}
                  InputProps={{
                    className: classes.inputText,
                  }}
                  InputLabelProps={{
                    focused: true
                  }}
                  id='filled-number'
                  label='Amount'
                  type='number'
                  variant='filled'
                  value={value}
                  onChange={i => setValue(i.target.value)}
                />
              </div>

              <div className={classes.buttons}>
                <Button
                  className={classes.button}
                  onClick={submit}
                  variant='contained'
                  color='primary'
                >
                  Submit
                </Button>
                <Button
                  className={classes.button}
                  onClick={handleClose}
                  variant='contained'
                  color='primary'
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Fade>
    </Modal>
  );
}

export default DepositModal;
