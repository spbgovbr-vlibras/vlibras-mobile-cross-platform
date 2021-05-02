import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';

interface StepTwoProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepTwo: React.FunctionComponent<StepTwoProps> = ({
  setShowModal,
  setCurrentStep,
  active,
  jump,
}) => {
  return (
    <>
      <p className="modal-onboarding-title">Passo 2</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          A pessoa que está falando em Libras deve aparecer completamente na
          imagem da câmera.
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
