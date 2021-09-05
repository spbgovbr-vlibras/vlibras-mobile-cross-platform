import React from 'react';

import { IonModal } from '@ionic/react';

import { logoWarning } from '../../assets';
import './styles.css';

interface ErrorModalProps {
  show: any;
  setShow: any;
  errorMsg: any;
}

const ErrorModal = ({ show, setShow, errorMsg }: ErrorModalProps) => {
  return (
    <IonModal
      isOpen={show}
      cssClass="error-modal"
      onDidDismiss={() => setShow(false)}
      backdropDismiss
      swipeToClose
    >
      <img className="loading" src={logoWarning} alt="Carregando" />
      <h1>Ops!</h1>
      <h2>{errorMsg}</h2>
    </IonModal>
  );
};

export default ErrorModal;
