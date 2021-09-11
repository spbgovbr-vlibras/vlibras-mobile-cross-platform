import React, { useState } from 'react';
import { IonModal, IonText, IonChip } from '@ionic/react';
import './styles.css';
import { Strings } from './strings';
import { IconArrowUpRight } from 'assets';

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
  return (
    <IonModal
      isOpen={showSuggestionFeedbackModal}
      cssClass={'suggestion-feedback-modal'}
      onDidDismiss={handleCloseModal}
      swipeToClose={true}
    >
      <div className="text-container">
        <IonText class="modal-title">{Strings.TITLE_MENU_MODAL}</IonText>
        <IonText class="subtitle">{Strings.SUBTITLE_MENU_MODAL}</IonText>
      </div>
      <IonChip class="wikilibras-chip" onClick={handleOpenWikilibrasSite}>
        <IonText class="chip-text-space">{Strings.CHIP_TEXT}</IonText>
        <IconArrowUpRight />
      </IonChip>
    </IonModal>
  );
};

export default SuggestionFeedbackModal;
