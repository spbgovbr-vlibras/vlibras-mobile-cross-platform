import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';
import { Strings } from '../strings';
import { gifStepOne } from '../../../assets';

interface StepOneProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepOne = ({ setCurrentStep, active, jump }: StepOneProps) => {
  return (
    <>
      <p className="modal-onboarding-title"> {Strings.STEPONE_TITLE} </p>
      <div className="modal-description">
        <p className="modal-onboarding-body">{Strings.STEPONE_DESCRIPTION}</p>
      </div>
      <IonImg src={gifStepOne} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
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
