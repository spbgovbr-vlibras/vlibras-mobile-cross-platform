import React, { useState } from 'react';

import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';

import { IconCloseCircle, IconThumbDown, IconThumbUp } from 'assets';
import './styles.css';
import EvaluationNoModal from 'components/EvaluationNoModal';
import EvaluationYesModal from 'components/EvaluationYesModal';
import RevisionModal from 'components/RevisionModal';

import { Strings } from './strings';

interface EvaluationModalProps {
  show: any;
  setShow: any;
  showYes: any;
  setShowYes: any;
  showNo: any;
  setShowNo: any;
  showSuggestionModal: any;
  setShowSuggestionModal: any;
  showSuggestionFeedbackModal: boolean;
  setSuggestionFeedbackModal: any;
  isPlaying: boolean;
}

const EvaluationModal = ({
  show,
  setShow,
  showYes,
  setShowYes,
  showNo,
  setShowNo,
  showSuggestionModal,
  setShowSuggestionModal,
  showSuggestionFeedbackModal,
  setSuggestionFeedbackModal,
  isPlaying,
}: EvaluationModalProps) => {
  const closeModal = () => {
    setShow(false);
  };

  return (
    <div>
      <IonModal
        isOpen={show}
        cssClass="evaluation-modal"
        onDidDismiss={closeModal}
        swipeToClose
      >
        <div className="evaluation-modal-container-close-button-container">
          <button type="button" onClick={closeModal}>
            <IconCloseCircle color="#4E4E4E" />
          </button>
        </div>

        <p className="modal-title"> {Strings.TITLE_MENU_MODAL} </p>

        <div className="evaluation-modal-container-rating-chips">
          <IonChip
            class="evaluation-modal-container-rating-chips-yes"
            onClick={() => {
              setShow(false);
              setShowYes(true);
            }}
          >
            <IconThumbUp color="#4E4E4E" />
            <IonText class="evaluation-modal-container-rating-chips-texts">
              {Strings.CHIP_YES}
            </IonText>
          </IonChip>
          <IonChip
            class="evaluation-modal-container-rating-chips-no"
            onClick={() => {
              setShow(false);
              setShowNo(true);
            }}
          >
            <IconThumbDown color="#4E4E4E" />
            <IonText class="evaluation-modal-container-rating-chips-texts">
              {Strings.CHIP_NO}
            </IonText>
          </IonChip>
        </div>
      </IonModal>
      <EvaluationYesModal showYes={showYes} setShowYes={setShowYes} />
      <EvaluationNoModal
        showNo={showNo}
        setShowNo={setShowNo}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setSuggestionFeedbackModal={setSuggestionFeedbackModal}
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default EvaluationModal;
