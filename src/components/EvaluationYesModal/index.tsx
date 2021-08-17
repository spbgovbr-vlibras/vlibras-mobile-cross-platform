import React, { useState } from 'react';
import { IconThumbUp } from 'assets';
import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';
import './styles.css';
import { Strings } from './strings';

interface EvaluationYesModalProps {
  showYes: any;
  setShowYes: any;
}

const EvaluationYesModal = ({ showYes, setShowYes}: EvaluationYesModalProps) => {
  const handleCloseModal = () => {
    setShowYes(false);
  }
  return (
    <IonModal
      isOpen={showYes}
      cssClass={'evaluation-yes-modal'}
      onDidDismiss={handleCloseModal}
      swipeToClose={true}
    >
      <div className="modal-title">
        <IconThumbUp color="black" />
        <IonText class="text-space">{Strings.TITLE_MENU_MODAL}</IonText>
      </div>
      <IonText class="subtitle">{Strings.SUBTITLE_MENU_MODAL}</IonText>
    </IonModal>
  );
};

export default EvaluationYesModal;
