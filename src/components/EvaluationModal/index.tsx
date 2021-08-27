import React, { useState } from 'react';
import { IconCloseCircle, IconThumbDown, IconThumbUp } from 'assets';
import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';
import './styles.css';
import { Strings } from './strings';
import EvaluationYesModal from 'components/EvaluationYesModal';
import EvaluationNoModal from 'components/EvaluationNoModal';
import RevisionModal from 'components/RevisionModal';

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
}: EvaluationModalProps) => {
  const closeModal = () => {
    setShow(false);
  };

  return (
    <div>
      <IonModal
        isOpen={show}
        cssClass={'evaluation-modal'}
        onDidDismiss={closeModal}
        swipeToClose={true}
      >
        <button
          className="evaluation-modal-container-close-button"
          type="button"
          onClick={closeModal}
        >
          <IconCloseCircle color={'#4E4E4E'} />
        </button>

        <p className="modal-title"> {Strings.TITLE_MENU_MODAL} </p>

        <div className="evaluation-modal-container-rating-chips">
          <IonChip
            class="evaluation-modal-container-rating-chips-yes"
            onClick={() => {
              setShow(false);
              setShowYes(true);
            }}
          >
            <IconThumbUp color={'#4E4E4E'} />
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
            <IconThumbDown color={'#4E4E4E'} />
            <IonText class="evaluation-modal-container-rating-chips-texts">
              {Strings.CHIP_NO}
            </IonText>
          </IonChip>
        </div>
      </IonModal>
      <EvaluationYesModal showYes={showYes} setShowYes={setShowYes}/>
      <EvaluationNoModal
        showNo={showNo}
        setShowNo={setShowNo}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setSuggestionFeedbackModal={setSuggestionFeedbackModal}
      />
    </div>
  );
};

export default EvaluationModal;
