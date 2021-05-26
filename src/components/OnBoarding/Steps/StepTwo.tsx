import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';
import { Strings } from '../strings';
import { gifStepTwo } from '../../../assets';

interface StepTwoProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepTwo = ({ setCurrentStep, active, jump }: StepTwoProps) => {
  return (
    <>
      <p className="modal-onboarding-title"> {Strings.STEPTWO_TITLE} </p>
      <div className="modal-description">
        <p className="modal-onboarding-body">{Strings.STEPTWO_DESCRIPTION}</p>
      </div>
      <IonImg src={gifStepTwo} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
        <IonButton
          className="goback-modal-button"
          onClick={() => setCurrentStep(1)}
        >
          {Strings.BUTTON_BACK}
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(3)}
        >
          {Strings.BUTTON_NEXT}
        </IonButton>
      </div>
    </>
  );
};

export default StepTwo;
