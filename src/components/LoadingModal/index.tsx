import React from 'react';

import { IonModal } from '@ionic/react';

import { gifTranslating } from '../../assets';
import './styles.css';

interface LoadingModalProps {
  loading: boolean;
  setLoading: any;
  text: string;
}

const LoadingModal = ({ loading, setLoading, text }: LoadingModalProps) => {
  return (
    <IonModal
      isOpen={loading}
      className="translating-modal"
      onDidDismiss={() => setLoading(false)}
      canDismiss>
      <p className="modal-title"> {text} </p>
      <img className="loading" src={gifTranslating} alt="Carregando" />
    </IonModal>
  );
};

export default LoadingModal;
