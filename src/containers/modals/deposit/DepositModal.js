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

import React, { useState, useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { closeModal } from 'actions/uiAction';
import { getToken } from 'actions/tokenAction';
import networkService from 'services/networkService';

import Modal from 'components/modal/Modal';

import InputStep from './steps/InputStep';
import ApproveStep from './steps/ApproveStep';

const ETH = networkService.OmgUtil.transaction.ETH_CURRENCY;

function DepositModal ({ open }) {
  const dispatch = useDispatch();

  const [ step, setStep ] = useState('INPUT_STEP');
  const [ currency, setCurrency ] = useState(ETH);
  const [ tokenInfo, setTokenInfo ] = useState({});
  const [ value, setValue ] = useState('');

  useEffect(() => {
    async function getTokenInfo () {
      if (currency && networkService.web3.utils.isAddress(currency)) {
        const tokenInfo = await getToken(currency);
        setTokenInfo(tokenInfo);
      } else {
        setTokenInfo({});
      }
    }
    getTokenInfo();
  }, [ currency ]);

  const handleClose = useCallback(() => {
    setCurrency(ETH);
    setValue('');
    setStep('INPUT_STEP');
    dispatch(closeModal('depositModal'));
  }, [ dispatch ]);

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 'INPUT_STEP' && (
        <InputStep
          onClose={handleClose}
          onNext={() => setStep('APPROVE_STEP')}
          currency={currency}
          tokenInfo={tokenInfo}
          value={value}
          setCurrency={setCurrency}
          setTokenInfo={setTokenInfo}
          setValue={setValue}
        />
      )}
      {step === 'APPROVE_STEP' && (
        <ApproveStep
          onClose={handleClose}
          currency={currency}
          value={value}
          tokenInfo={tokenInfo}
        />
      )}
    </Modal>
  );
}

export default React.memo(DepositModal);
