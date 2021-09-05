import React from 'react';

import { IonModal } from '@ionic/react';

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
      cssClass="translating-modal"
      onDidDismiss={() => setLoading(false)}
      swipeToClose
    >
      <p className="modal-title"> Traduzindo... </p>
      <img className="loading" src={gifTranslating} alt="Carregando" />
    </IonModal>
  );
};

export default TranslatingModal;
