import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';

import { IonContent, IonModal, IonPage } from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';

import paths from '../../constants/paths';
import { MenuLayout } from '../../layouts';
import Presentation from './Steps/Presentation';
import StepFour from './Steps/StepFour';
import StepOne from './Steps/StepOne';
import StepThree from './Steps/StepThree';
import StepTwo from './Steps/StepTwo';
import { Strings } from './strings';

import './styles.css';

const OnBoarding = () => {
  const [showModal, setShowModal] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [chooseRender, setChooseRender] = useState(<></>);
  const history = useHistory();
  const location = useLocation();

  useEffect(() => {
    setShowModal(true);
  }, [location]);

  const closeModal = () => {
    setShowModal(false);
    setCurrentStep(0);
    history.push(paths.DOMAIN);
  };

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

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        {showModal && <div className="onboarding-modal"> {chooseRender}</div>}
      </IonContent>
    </MenuLayout>
  );
};

export default OnBoarding;
