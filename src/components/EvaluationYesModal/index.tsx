import React, { useState } from 'react';

import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';

import { IconThumbUp } from 'assets';

import './styles.css';
import { Strings } from './strings';

interface EvaluationYesModalProps {
  showYes: any;
  setShowYes: any;
}

const EvaluationYesModal = ({
  showYes,
  setShowYes,
}: EvaluationYesModalProps) => {
  const handleCloseModal = () => {
    setShowYes(false);
  };

  if (showYes) {
    setTimeout(handleCloseModal, 2000);
  }
  return (
    <IonModal
      isOpen={showYes}
      cssClass="evaluation-yes-modal"
      onDidDismiss={handleCloseModal}
      swipeToClose
    >
      <div className="modal-title">
        <IconThumbUp color="black" />
        <p className="text-space">{Strings.TITLE_MENU_MODAL}</p>
      </div>
      <p className="subtitle">{Strings.SUBTITLE_MENU_MODAL}</p>
    </IonModal>
  );
};

export default EvaluationYesModal;
