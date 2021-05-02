import Bullets from 'components/Bullets';
import React, { Dispatch, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';

interface StepFourProps {
  setShowModal: Dispatch<SetStateAction<boolean>>;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  active: number;
}

const StepFour: React.FunctionComponent<StepFourProps> = ({
  setShowModal,
  setCurrentStep,
  active,
}) => {
  const jump = () => {
    setShowModal(false);
  };

  return (
    <>
      <p className="modal-onboarding-title">Passo 4</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">
          Grave até 5 sinais de forma consecutiva. Para ver o resultado, clique
          em traduzir.
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
          onClick={() => setCurrentStep(3)}
        >
          Voltar
        </IonButton>
        <IonButton className="primary-modal-button" onClick={jump}>
          Iniciar
        </IonButton>
      </div>
    </>
  );
};

export default StepFour;
