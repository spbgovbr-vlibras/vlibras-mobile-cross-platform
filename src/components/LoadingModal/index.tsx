import { IonModal } from '@ionic/react';
import React from 'react';

import { gifTranslating } from '../../assets';
import './styles.css';

interface LoadingModalProps {
  loading: boolean;
  setLoading: any;
  text: string;
  canDismiss?: boolean;
}

const LoadingModal = ({ loading, setLoading, text, canDismiss = true }: LoadingModalProps) => {
  return (
    <IonModal
      isOpen={loading}
      className="translating-modal"
      onDidDismiss={() => setLoading(false)}
      canDismiss={canDismiss}>
      <p className="modal-title"> {text} </p>
      <img className="loading" src={gifTranslating} alt="Carregando" />
    </IonModal>
  );
};

export default LoadingModal;
