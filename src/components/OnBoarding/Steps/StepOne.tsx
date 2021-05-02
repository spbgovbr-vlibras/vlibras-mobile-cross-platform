import Bullets from 'components/Bullets';
import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';

interface StepOneProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const StepOne: React.FunctionComponent<StepOneProps> = ({
  setShowModal,
  setCurrentStep,
  active,
  jump,
}) => {
  return (
    <>
      <p className="modal-onboarding-title">Passo 1</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          Defina um domínio para a tradução. Ele representa o contexto ou
          temática das palavras que serão traduzidas.
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
          onClick={() => setCurrentStep(0)}
        >
          Voltar
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(2)}
        >
          Avançar
        </IonButton>
      </div>
    </>
  );
};

export default StepOne;
