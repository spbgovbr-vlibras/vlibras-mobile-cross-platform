import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';

interface StepThreeProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepThree: React.FunctionComponent<StepThreeProps> = ({
  setShowModal,
  setCurrentStep,
  active,
  jump,
}) => {
  return (
    <>
      <p className="modal-onboarding-title">Passo 3</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          Grave um sinal por vez para o sistema obter uma boa qualidade de
          tradução.
        </p>
      </div>
      <IonImg src={IcaroPreview} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          Pular
        </IonButton>
        <IonButton
          className="goback-modal-button"
          onClick={() => setCurrentStep(2)}
        >
          Voltar
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(4)}
        >
          Avançar
        </IonButton>
      </div>
    </>
  );
};

export default StepThree;
