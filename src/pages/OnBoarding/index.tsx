import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import { IonModal, IonPage } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import paths from '../../constants/paths';

import Presentation from './Steps/Presentation';
import StepOne from './Steps/StepOne';
import StepTwo from './Steps/StepTwo';
import StepThree from './Steps/StepThree';
import StepFour from './Steps/StepFour';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

// interface OnBoardingProps {
//   setShowRecorderArea: Dispatch<SetStateAction<boolean>>;
// }

const OnBoarding = () => {
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [chooseRender, setChooseRender] = useState(<></>);
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
    history.push(paths.DOMAIN);
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      {showModal && <div className="onboarding-modal"> {chooseRender}</div>}
    </MenuLayout>
  );
};

export default OnBoarding;
