import { IonButton, IonIcon, IonModal } from '@ionic/react';
import { closeOutline } from 'ionicons/icons';
import React, { Dispatch, SetStateAction, useEffect, useMemo } from 'react';

import { logoWarning } from '../../assets';
import './styles.css';

interface ErrorModalProps {
  show: boolean;
  setShow: Dispatch<SetStateAction<any>>;
  errorMsg: string;
  autoDismissMs?: number;
}

const ErrorModal = ({ show, setShow, errorMsg, autoDismissMs = 4000 }: ErrorModalProps) => {
  const close = useMemo(
    () => () => {
      setShow((prev: any) => {
        if (Array.isArray(prev)) return [false, prev[1]];
        return false;
      });
    },
    [setShow]
  );

  useEffect(() => {
    if (!show) return;
    if (!autoDismissMs) return;
    const id = window.setTimeout(() => close(), autoDismissMs);
    return () => window.clearTimeout(id);
  }, [show, autoDismissMs, close]);

  return (
    <IonModal
      isOpen={show}
      className="error-modal"
      onIonModalDidDismiss={close}
      backdropDismiss
      canDismiss>
      <IonButton
        className="error-modal-close"
        fill="clear"
        aria-label="Fechar"
        onClick={close}>
        <IonIcon icon={closeOutline} />
      </IonButton>
      <img className="loading" src={logoWarning} alt="Carregando" />
      <h1>Ops!</h1>
      <h2>{errorMsg}</h2>
    </IonModal>
  );
};

export default ErrorModal;
