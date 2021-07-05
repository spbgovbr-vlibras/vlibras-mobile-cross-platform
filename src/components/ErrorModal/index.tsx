import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { gifTranslating } from '../../assets';
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
      <img
        className="loading"
        src="https://cdn1.iconfinder.com/data/icons/color-bold-style/21/08-128.png"
      />

      {/* <p className="modal-title"> Erro </p> */}
      <p className="modal-desc"> {errorMsg} </p>
    </IonModal>
  );
};

export default ErrorModal;
