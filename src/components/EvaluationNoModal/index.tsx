import React, { useState } from 'react';

import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';

import { IconCloseCircle, IconThumbDown } from 'assets';
import './styles.css';
import RevisionModal from 'components/RevisionModal';

import { Strings } from './strings';

interface EvaluationNoModalProps {
  showNo: any;
  setShowNo: any;
  showSuggestionModal: any;
  setShowSuggestionModal: any;
  showSuggestionFeedbackModal: boolean;
  setSuggestionFeedbackModal: any;
  isPlaying: boolean;
}

const EvaluationNoModal = ({
  showNo,
  setShowNo,
  showSuggestionModal,
  setShowSuggestionModal,
  showSuggestionFeedbackModal,
  setSuggestionFeedbackModal,
  isPlaying,
}: EvaluationNoModalProps) => {
  return (
    <div>
      <IonModal
        isOpen={showNo}
        cssClass="evaluation-no-modal"
        onDidDismiss={() => setShowNo(false)}
        swipeToClose
      >
        <div className="evaluation-modal-container-close-button-container">
          <button
            type="button"
            onClick={() => {
              setShowNo(false);
              console.log(`NO MODAL:${showNo}`);
            }}
          >
            <IconCloseCircle color="#4e4e4e" />
          </button>
        </div>

        <div className="modal-title">
          <IconThumbDown color="black" />
          <p className="text-space">{Strings.TITLE_MENU_MODAL}</p>
        </div>
        <div>
          <IonChip
            class="evaluation-modal-container-chip-suggestion"
            onClick={() => {
              setShowSuggestionModal(true);
              setShowNo(false);
            }}
          >
            {Strings.EDIT_SUGGESTION}
          </IonChip>
        </div>
      </IonModal>
      <RevisionModal
        show={showSuggestionModal}
        setShow={setShowSuggestionModal}
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setSuggestionFeedbackModal={setSuggestionFeedbackModal}
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default EvaluationNoModal;
