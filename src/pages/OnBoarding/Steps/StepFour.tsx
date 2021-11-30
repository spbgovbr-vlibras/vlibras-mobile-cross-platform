import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';

import { IonButton, IonImg } from '@ionic/react';

import Bullets from 'components/Bullets';

import { IcaroPreview, gifStepFour } from '../../../assets';
import { Strings } from '../strings';

interface StepFourProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepFour: React.FunctionComponent<StepFourProps> = ({
  setCurrentStep,
  active,
  jump,
}) => {
  return (
    <>
      <div className="title-area">
        <p className="modal-onboarding-title">{Strings.STEPFOUR_TITLE}</p>
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
      </div>

      <div className="modal-description">
        <p className="modal-onboarding-body">{Strings.STEPFOUR_DESCRIPTION}</p>
      </div>
      <IonImg src={gifStepFour} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton
          className="goback-modal-button"
          onClick={() => setCurrentStep(3)}
        >
          {Strings.BUTTON_BACK}
        </IonButton>
        <IonButton className="primary-modal-button" onClick={jump}>
          {Strings.BUTTON_START}
        </IonButton>
      </div>
    </>
  );
};

export default StepFour;
