import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';
import { Strings } from '../strings';

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
      <IonImg src={IcaroPreview} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          Pular
        </IonButton>
        <IonButton
          className="goback-modal-button"
          onClick={() => setCurrentStep(1)}
        >
          Voltar
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(3)}
        >
          Avançar
        </IonButton>
      </div>
    </>
  );
};

export default StepTwo;
