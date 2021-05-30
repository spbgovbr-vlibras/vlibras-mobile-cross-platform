import React, { useState, useEffect } from 'react';
import { IonModal } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import paths from '../../constants/paths';

import Presentation from './Steps/Presentation';
import StepOne from './Steps/StepOne';
import StepTwo from './Steps/StepTwo';
import StepThree from './Steps/StepThree';
import StepFour from './Steps/StepFour';

import './styles.css';
const ModalExample = () => {
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [chooseRender, setChooseRender] = useState(<></>);
  const [showDomain, setShowDomain] = useState(false);
  const history = useHistory();

  useEffect(() => {
    switch (currentStep) {
      case 0:
        setChooseRender(
          <Presentation setCurrentStep={setCurrentStep} jump={closeModal} />,
        );
        break;
      case 1:
        setChooseRender(
          <StepOne
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 2:
        setChooseRender(
          <StepTwo
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 3:
        setChooseRender(
          <StepThree
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 4:
        setChooseRender(
          <StepFour
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      default:
        setChooseRender(<> </>);
        break;
    }
  }, [currentStep]);

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    setShowDomain(true);
    history.push(paths.DOMAIN);
  };

  return (
    <>
      {showModal && <div className="onboarding-modal"> {chooseRender}</div>}
      {/* {showDomain && <Domain />} */}
    </>
  );
};

export default ModalExample;
