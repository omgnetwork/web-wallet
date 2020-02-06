// we use BigNumber here for decimal support
import BigNumber from 'bignumber.js';

export function logAmount (amount, power) {
  const x = new BigNumber(amount);
  const exp = new BigNumber(10).pow(power);

  const calculated = x.div(exp);
  return calculated.toFixed();
}

