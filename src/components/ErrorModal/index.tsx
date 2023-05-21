import React, { Dispatch, SetStateAction } from 'react';

import { IonModal } from '@ionic/react';

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
      onDidDismiss={() => setShow([false, ''])}
      backdropDismiss>
      <img className="loading" src={logoWarning} alt="Carregando" />
      <h1>Ops!</h1>
      <h2>{errorMsg}</h2>
    </IonModal>
  );
};

export default ErrorModal;
