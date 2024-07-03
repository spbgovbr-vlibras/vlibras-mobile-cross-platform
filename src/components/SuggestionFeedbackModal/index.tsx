import { IonModal, IonText, IonChip } from '@ionic/react';
import React from 'react';

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
      className="suggestion-feedback-modal"
      onIonModalDidDismiss={handleCloseModal}
      canDismiss>
      <div className="text-container">
        <IonText className="modal-title">{Strings.TITLE_MENU_MODAL}</IonText>
        <p className="subtitle">{Strings.SUBTITLE_MENU_MODAL}</p>
      </div>
      <IonChip className="wikilibras-chip" onClick={handleOpenWikilibrasSite}>
        <span className="chip-text-space">{Strings.CHIP_TEXT}</span>
        <IconArrowUpRight />
      </IonChip>
    </IonModal>
  );
};

export default SuggestionFeedbackModal;
