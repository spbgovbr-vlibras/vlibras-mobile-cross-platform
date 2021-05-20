import Bullets from 'components/Bullets';
import React, { Dispatch, SetStateAction } from 'react';
import { IonButton, IonImg } from '@ionic/react';
import { IcaroPreview } from '../../../assets';
import { Strings } from '../strings';

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
      <p className="modal-onboarding-title">{Strings.STEPFOUR_TITLE}</p>
      <div className="modal-description">
        <p className="modal-onboarding-body">{Strings.STEPFOUR_DESCRIPTION}</p>
      </div>
      <IonImg src={IcaroPreview} className="icaro-preview" />
      <Bullets active={active} />
      <div className="buttons-area">
        <IonButton className="jump-button" onClick={jump}>
          {Strings.BUTTON_JUMP}
        </IonButton>
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