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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { closeModal } from 'actions/uiAction';

import Modal from 'components/modal/Modal';

import SelectStep from './steps/SelectStep';
import AddTokenStep from './steps/AddTokenStep';
import DoExitStep from './steps/DoExitStep';

function ExitModal ({ open }) {
  const dispatch = useDispatch();

  const [ gasPrice, setGasPrice ] = useState();
  const [ selectedSpeed, setSelectedSpeed ] = useState('normal');
  const [ selectedUTXO, setSelectedUTXO ] = useState();
  const [ step, setStep ] = useState(1);

  function handleClose () {
    setSelectedUTXO();
    setStep(1);
    dispatch(closeModal('exitModal'));
  }

  return (
    <Modal open={open} onClose={handleClose}>
      {step === 1 && (
        <SelectStep
          selectedUTXO={selectedUTXO}
          setSelectedUTXO={setSelectedUTXO}
          handleClose={handleClose}
          setStep={setStep}
          gasPrice={gasPrice}
          setGasPrice={setGasPrice}
          selectedSpeed={selectedSpeed}
          setSelectedSpeed={setSelectedSpeed}
        />
      )}
      {step === 2 && (
        <AddTokenStep
          setSelectedUTXO={setSelectedUTXO}
          selectedUTXO={selectedUTXO}
          setStep={setStep}
          gasPrice={gasPrice}
        />
      )}
      {step === 3 && (
        <DoExitStep
          selectedUTXO={selectedUTXO}
          handleClose={handleClose}
          gasPrice={gasPrice}
        />
      )}
    </Modal>
  );
}

export default React.memo(ExitModal);
