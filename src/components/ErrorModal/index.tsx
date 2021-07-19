import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
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
      cssClass={'error-modal'}
      onDidDismiss={() => setShow(false)}
      swipeToClose={true}
    >
      <img className="loading" src={logoWarning} />

      <p className="modal-title"> Ops! </p>
      <p className="modal-desc"> {errorMsg} </p>
    </IonModal>
  );
};

export default ErrorModal;
