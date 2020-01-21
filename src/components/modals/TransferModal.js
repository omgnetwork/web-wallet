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
  FormControl,
  MenuItem,
  Select,
  InputLabel
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
  },
  select: {
    color: 'white'
  }
});

function TransferModal ({ open, toggle }) {
  const classes = useStyles();
  const [ loading, setLoading ] = useState(false);
  const [ value, setValue ] = useState(0);
  const [ feeValue, setFeeValue ] = useState(0);
  const [ currency, setCurrency ] = useState(OmgUtil.transaction.ETH_CURRENCY);
  const [ feeToken, setFeeToken ] = useState(OmgUtil.transaction.ETH_CURRENCY);
  const [ recipient, setRecipient ] = useState('');
  const [ metadata, setMetadata ] = useState('');
  const [ success, setSuccess ] = useState(false);
  const [ ccTokens, setCcTokens ] = useState([]);

  async function fetchBalances () {
    const { childchain } = await networkService.getBalances();
    setCcTokens(childchain);
  }

  useEffect(() => {
    if (open) {
      fetchBalances(networkService.account);
    }
  }, [open])

  async function submit () {
    if (
      value &&
      feeValue &&
      currency &&
      feeToken &&
      recipient
    ) {
      setLoading(true);
      try {
        await networkService.transfer({
          recipient,
          value,
          currency,
          feeValue,
          feeToken,
          metadata
        });
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
    <>
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
                <div>Transfer successful. Your OMG Network balance will be updated shortly.</div>
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
                <h2>Transfer</h2>
                <div className={classes.inputRow}>
                  <TextField
                    className={classes.input}
                    InputProps={{ className: classes.inputText }}
                    InputLabelProps={{ focused: true }}
                    id='filled-basic'
                    label='Recipient'
                    type='numbertext'
                    variant='filled'
                    value={recipient}
                    onChange={i => setRecipient(i.target.value)}
                  />
                  <FormControl variant='filled' className={classes.input}>
                    <InputLabel focused id='demo-simple-select-filled-label'>
                      Currency
                    </InputLabel>
                    <Select
                      displayEmpty
                      labelId='demo-simple-select-filled-label'
                      id='demo-simple-select-filled'
                      value={currency}
                      color='primary'
                      onChange={e => setCurrency(e.target.value)}
                      classes={{ select: classes.select }}
                    >
                      {ccTokens.map(i => (
                        <MenuItem key={i.token} value={i.token}>{i.symbol}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    className={classes.input}
                    InputProps={{ className: classes.inputText }}
                    InputLabelProps={{ focused: true }}
                    id='filled-number'
                    label='Amount'
                    type='number'
                    variant='filled'
                    value={value}
                    onChange={i => setValue(i.target.value)}
                  />
                  <FormControl variant='filled' className={classes.input}>
                    <InputLabel focused id='demo-simple-select-filled-label'>
                      Fee Currency
                    </InputLabel>
                    <Select
                      displayEmpty
                      labelId='demo-simple-select-filled-label'
                      id='demo-simple-select-filled'
                      value={feeToken}
                      color='primary'
                      onChange={e => setFeeToken(e.target.value)}
                      classes={{ select: classes.select }}
                    >
                      {ccTokens.map(i => (
                        <MenuItem key={i.token} value={i.token}>{i.symbol}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    className={classes.input}
                    InputProps={{ className: classes.inputText }}
                    InputLabelProps={{ focused: true }}
                    id='filled-number'
                    label='Fee Amount'
                    type='number'
                    variant='filled'
                    value={feeValue}
                    onChange={i => setFeeValue(i.target.value)}
                  />
                  <TextField
                    className={classes.input}
                    InputProps={{ className: classes.inputText }}
                    InputLabelProps={{ focused: true }}
                    id='filled-basic'
                    label='Metadata'
                    type='numbertext'
                    variant='filled'
                    value={metadata}
                    onChange={i => setMetadata(i.target.value)}
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
    </>
  );
}

export default TransferModal;
