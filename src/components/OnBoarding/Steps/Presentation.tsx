import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';
import { Strings } from '../strings';

interface PresentationProps {
  setCurrentStep: Dispatch<SetStateAction<number>>;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const Presentation = ({ setCurrentStep, jump }: PresentationProps) => {
  return (
    <>
      <p className="modal-onboarding-title"> {Strings.PRESENTATION_TITLE} </p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          {Strings.PRESENTATION_DESCRIPTION}
        </p>
      </div>
      <IonImg src={IcaroPreview} className="icaro-preview" />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(1)}
        >
          {Strings.BUTTON_PROCEED}
        </IonButton>
      </div>
    </>
  );
};

export default Presentation;
