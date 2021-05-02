import React, { useState, useEffect } from 'react';
import { IonModal, IonButton } from '@ionic/react';

import Presentation from './Steps/Presentation';
import StepOne from './Steps/StepOne';
import StepTwo from './Steps/StepTwo';
import StepThree from './Steps/StepThree';
import StepFour from './Steps/StepFour';

import './styles.css';
const ModalExample = () => {
  const [showModal, setShowModal] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [chooseRender, setChooseRender] = useState(<></>);

  useEffect(() => {
    switch (currentStep) {
      case 0:
        setChooseRender(
          <Presentation
            setShowModal={setShowModal}
            setCurrentStep={setCurrentStep}
            jump={closeModal}
          />,
        );
        break;
      case 1:
        setChooseRender(
          <StepOne
            setShowModal={setShowModal}
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 2:
        setChooseRender(
          <StepTwo
            setShowModal={setShowModal}
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 3:
        setChooseRender(
          <StepThree
            setShowModal={setShowModal}
            setCurrentStep={setCurrentStep}
            active={currentStep}
            jump={closeModal}
          />,
        );
        break;
      case 4:
        setChooseRender(
          <StepFour
            setShowModal={setShowModal}
            setCurrentStep={setCurrentStep}
            active={currentStep}
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
  };

  return (
    <>
      <IonModal
        isOpen={showModal}
        cssClass="onboarding-modal"
        swipeToClose={true}
        onDidDismiss={closeModal}
      >
        {chooseRender}
      </IonModal>
      <IonButton onClick={() => setShowModal(true)}>Show Modal</IonButton>
    </>
  );
};

export default ModalExample;
