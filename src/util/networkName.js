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

import { capitalize, omit } from 'lodash';
import config from 'util/config';

const networkMap = {
  'ropsten': 'Ropsten Test Network',
  'main': 'Main Ethereum Network',
  'rinkeby': 'Rinkeby Test Network',
  'kovan': 'Kovan Test Network'
};

export function getNetworkName () {
  return networkMap[config.network];
}

export function getOtherNetworks () {
  const otherNetworks = omit(networkMap, [ config.network ]);
  return Object.values(otherNetworks);
}
