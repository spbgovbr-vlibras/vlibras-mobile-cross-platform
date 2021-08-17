import React, { useState } from 'react';
import { IconCloseCircle, IconThumbDown } from 'assets';
import { IonModal, IonButton, IonText, IonChip } from '@ionic/react';
import './styles.css';
import { Strings } from './strings';
import RevisionModal from 'components/RevisionModal';

interface EvaluationNoModalProps {
  showNo: any;
  setShowNo: any;
  showSuggestionModal: any;
  setShowSuggestionModal: any;
}

const EvaluationNoModal = ({
  showNo,
  setShowNo,
  showSuggestionModal,
  setShowSuggestionModal,
}: EvaluationNoModalProps) => {
  return (
    <div>
      <IonModal
        isOpen={showNo}
        cssClass={'evaluation-no-modal'}
        onDidDismiss={() => setShowNo(false)}
        swipeToClose={true}
      >
        <button
          className="evaluation-modal-container-close-button"
          type="button"
          onClick={() => {
            setShowNo(false);
            console.log('NO MODAL:' + showNo);
          }}
        >
          <IconCloseCircle color="#4e4e4e" />
        </button>
        <div className="modal-title">
          <IconThumbDown color="black" />
          <IonText class="text-space">{Strings.TITLE_MENU_MODAL}</IonText>
        </div>
        <IonChip
          class="evaluation-modal-container-chip-suggestion"
          onClick={() => {
            setShowSuggestionModal(true);
            setShowNo(false);
          }}
        >
          {Strings.EDIT_SUGGESTION}
        </IonChip>
      </IonModal>
      <RevisionModal
        show={showSuggestionModal}
        setShow={setShowSuggestionModal}
      ></RevisionModal>
    </div>
  );
};

export default EvaluationNoModal;
