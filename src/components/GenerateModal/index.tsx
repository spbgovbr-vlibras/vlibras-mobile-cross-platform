import React from 'react';

import { IonModal, IonSpinner } from '@ionic/react';

import { Strings } from './strings';
import './styles.css';

interface GenerateModalProps {
  visible: boolean;
  setVisible: (show: boolean) => void;
}

const GenerateModal = ({ visible, setVisible }: GenerateModalProps) => {
  return (
    <IonModal
      isOpen={visible}
      cssClass="generate-modal"
      onDidDismiss={() => setVisible(false)}
      swipeToClose={false}
      backdropDismiss={false}
    >
      <h1>{Strings.TITLE}</h1>
      <h2>{Strings.DESCRIPTION}</h2>
      <IonSpinner className="generate-modal-spinner" name="crescent" />
    </IonModal>
  );
};

export default GenerateModal;
