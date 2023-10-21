import { IonModal } from '@ionic/react';
import React, { Dispatch, SetStateAction } from 'react';

import { logoWarning } from '../../assets';
import './styles.css';

interface ErrorModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<any>>;
  errorMsg: string;
}

const ErrorModal = ({ show, setShow, errorMsg }: ErrorModalProps) => {
  return (
    <IonModal
      isOpen={show}
      className="error-modal"
      onIonModalDidDismiss={() => setShow(false)}
      onIonModalDidPresent={() => { setTimeout(() => setShow(false), 2000); } }
      backdropDismiss={false}
      canDismiss>
      <img className="loading" src={logoWarning} alt="Carregando" />
      <h1>Ops!</h1>
      <h2>{errorMsg}</h2>
    </IonModal>
  );
};

export default ErrorModal;
