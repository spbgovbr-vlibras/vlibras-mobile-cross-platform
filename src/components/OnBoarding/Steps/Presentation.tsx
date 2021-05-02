import React, { Dispatch, MouseEventHandler, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';

interface PresentationProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  jump: MouseEventHandler<HTMLIonButtonElement>;
}

const Presentation: React.FunctionComponent<PresentationProps> = ({
  setShowModal,
  setCurrentStep,
  jump,
}) => {
  return (
    <>
      <p className="modal-onboarding-title">Apresentação</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          Veja o passo a passo para a gravação e tradução dos sinais em Libras.
        </p>
      </div>
      <IonImg src={IcaroPreview} className="icaro-preview" />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          Pular
        </IonButton>
        <IonButton
          className="primary-modal-button"
          onClick={() => setCurrentStep(1)}
        >
          Ver passos
        </IonButton>
      </div>
    </>
  );
};

export default Presentation;
