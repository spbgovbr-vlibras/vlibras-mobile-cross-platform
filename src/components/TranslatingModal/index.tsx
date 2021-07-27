import React, { useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { gifTranslating } from '../../assets';
import './styles.css';

interface TranslatingModalProps {
  loading: boolean;
  setLoading: any;
}

const TranslatingModal = ({ loading, setLoading }: TranslatingModalProps) => {
  return (
    <IonModal
      isOpen={loading}
      cssClass={'translating-modal'}
      onDidDismiss={() => setLoading(false)}
      swipeToClose={true}
    >
      <p className="modal-title"> Traduzindo... </p>
      <img className="loading" src={gifTranslating} />
    </IonModal>
  );
};

export default TranslatingModal;
