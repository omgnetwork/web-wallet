import erc20abi from 'human-standard-token-abi';
import networkService from 'services/networkService';
import truncate from 'truncate-middle';
import axios from 'axios';
import store from 'store';

export async function getToken (currency) {
  const state = store.getState();
  if (state.token[currency]) {
    return state.token[currency]
  }

  const tokenContract = new networkService.web3.eth.Contract(erc20abi, currency);
  const [ _name, _decimals ] = await Promise.all([
    tokenContract.methods.symbol().call(),
    tokenContract.methods.decimals().call()
  ]).catch(e => null);

  let icon = ''
  try {
    const iconAddress = `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/${currency}/logo.png`
    const validIcon = await axios.get(iconAddress);
    if (validIcon) {
      icon = iconAddress
    }
  } catch (err) {
    //
  }

  const decimals = _decimals ? Number(_decimals.toString()) : 0;
  const name = _name || truncate(currency, 6, 4, '...');

  const tokenInfo = {
    currency,
    decimals,
    name,
    icon
  }

  store.dispatch({
    type: 'TOKEN/GET/SUCCESS',
    payload: tokenInfo
  })
  return tokenInfo
}
