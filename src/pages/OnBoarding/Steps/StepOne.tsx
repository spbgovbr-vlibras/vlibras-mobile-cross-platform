import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';

import { IonButton, IonImg } from '@ionic/react';

import Bullets from 'components/Bullets';

import { IcaroPreview, gifStepOne } from '../../../assets';
import { Strings } from '../strings';

interface StepOneProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepOne = ({ setCurrentStep, active, jump }: StepOneProps) => {
  return (
    <>
      <div className="title-area">
        <p className="modal-onboarding-title"> {Strings.STEPONE_TITLE} </p>
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
      </div>
      <div className="modal-description">
        <p className="modal-onboarding-body">{Strings.STEPONE_DESCRIPTION}</p>
      </div>
      <IonImg src={gifStepOne} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton
          className="goback-modal-button"
          onClick={() => setCurrentStep(0)}
        >
          {Strings.BUTTON_BACK}
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(2)}
        >
          {Strings.BUTTON_NEXT}
        </IonButton>
      </div>
    </>
  );
};

export default StepOne;
