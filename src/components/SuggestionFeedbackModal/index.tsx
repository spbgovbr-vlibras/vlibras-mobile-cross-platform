import React, { useState } from 'react';

import { IonModal, IonText, IonChip } from '@ionic/react';

import { IconArrowUpRight } from 'assets';
import './styles.css';

import { Strings } from './strings';

interface SuggestionFeedbackModalProps {
  showSuggestionFeedbackModal: any;
  setShowSuggestionFeedbackModal: any;
}

const SuggestionFeedbackModal = ({
  showSuggestionFeedbackModal,
  setShowSuggestionFeedbackModal,
}: SuggestionFeedbackModalProps) => {
  const handleCloseModal = () => {
    setShowSuggestionFeedbackModal(false);
  };

  const handleOpenWikilibrasSite = () => {
    window.open('https://wiki.vlibras.gov.br', '_system', 'location=yes');
  };

  if (showSuggestionFeedbackModal) {
    setTimeout(handleCloseModal, 2000);
  }
  return (
    <IonModal
      isOpen={showSuggestionFeedbackModal}
      cssClass="suggestion-feedback-modal"
      onDidDismiss={handleCloseModal}
      swipeToClose
    >
      <div className="text-container">
        <IonText class="modal-title">{Strings.TITLE_MENU_MODAL}</IonText>
        <p className="subtitle">{Strings.SUBTITLE_MENU_MODAL}</p>
      </div>
      <IonChip class="wikilibras-chip" onClick={handleOpenWikilibrasSite}>
        <span className="chip-text-space">{Strings.CHIP_TEXT}</span>
        <IconArrowUpRight />
      </IonChip>
    </IonModal>
  );
};

export default SuggestionFeedbackModal;
