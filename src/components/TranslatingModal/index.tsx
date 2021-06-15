import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { gifTranslating } from '../../assets';
import './styles.css';

const TranslatingModal = () => {
  return (
    <>
      <IonModal
        isOpen={true}
        cssClass={'translating-modal'}
        swipeToClose={true}
      >
        <p className="modal-title"> Traduzindo... </p>
        <img className="loading" src={gifTranslating} />
      </IonModal>
    </>
  );
};

export default TranslatingModal;
