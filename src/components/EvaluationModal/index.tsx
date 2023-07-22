import { IonModal, IonText, IonChip } from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';

import { IconCloseCircle, IconThumbDown, IconThumbUp } from 'assets';
import EvaluationNoModal from 'components/EvaluationNoModal';
import EvaluationYesModal from 'components/EvaluationYesModal';
import { useTranslation } from 'hooks/Translation';
import { sendReview } from 'services/suggestionGloss';

import './styles.css';
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
  onSubmittedRevision?: () => void;
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
  onSubmittedRevision,
}: EvaluationModalProps) => {
  const { textPtBr, textGloss, setTextPtBr } = useTranslation();

  const closeModal = () => {
    setShow(false);
  };

  const handlePositiveRevision = useCallback(async () => {
    setShow(false);
    setShowYes(true);
    if(onSubmittedRevision) {
      onSubmittedRevision();
    }

    await sendReview({
      text: textPtBr,
      translation: textGloss,
      review: textGloss,
      rating: 'good',
    });
  }, [textPtBr, textGloss, setShow, setShowYes, setTextPtBr, sendReview, onSubmittedRevision]);

  return (
    <div>
      <IonModal
        isOpen={show}
        className="evaluation-modal"
        onIonModalDidDismiss={closeModal}
        canDismiss>
        <div className="evaluation-modal-container-close-button-container">
          <button type="button" onClick={closeModal}>
            <IconCloseCircle color="#4E4E4E" />
          </button>
        </div>

        <p className="modal-title"> {Strings.TITLE_MENU_MODAL} </p>

        <div className="evaluation-modal-container-rating-chips">
          <IonChip
            className="evaluation-modal-container-rating-chips-yes"
            onClick={handlePositiveRevision}>
            <IconThumbUp color="#4E4E4E" />
            <IonText className="evaluation-modal-container-rating-chips-texts">
              {Strings.CHIP_YES}
            </IonText>
          </IonChip>
          <IonChip
            className="evaluation-modal-container-rating-chips-no"
            onClick={() => {
              setShow(false);
              setShowNo(true);
            }}>
            <IconThumbDown color="#4E4E4E" />
            <IonText className="evaluation-modal-container-rating-chips-texts">
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
        onSubmittedRevision={onSubmittedRevision}
      />
    </div>
  );
};

export default EvaluationModal;
