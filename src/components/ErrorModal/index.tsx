import React, { Dispatch, SetStateAction } from 'react';

import { IonModal } from '@ionic/react';

import { logoWarning } from '../../assets';
import './styles.css';

type errorModalType = boolean | string;
interface ErrorModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<any>>;
  errorMsg: string;
}

const ErrorModal = ({ show, setShow, errorMsg }: ErrorModalProps) => {
  return (
    <IonModal
      isOpen={show}
      cssClass="error-modal"
      onDidDismiss={() => setShow([false, ''])}
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
