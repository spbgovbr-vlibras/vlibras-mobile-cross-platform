import { IonModal, IonSpinner } from '@ionic/react';
import React from 'react';

import { TranslationRequestType } from 'constants/types';

import { Strings } from './strings';
import './styles.css';

interface GenerateModalProps {
  visible: boolean;
  setVisible: (show: boolean) => void;
  translationRequestType?: TranslationRequestType;
}

const getModalTexts = (
  translationRequestType: TranslationRequestType
): {
  title: string;
  description: string;
} => {
  switch (translationRequestType) {
    case TranslationRequestType.GLOSS_ONLY:
      return {
        title: Strings.GLOSS_ONLY_TITLE,
        description: Strings.GLOSS_ONLY_DESCRIPTION,
      };
    default:
      return {
        title: Strings.VIDEO_SHARE_TITLE,
        description: Strings.VIDEO_SHARE_DESCRIPTION,
      };
  }
};

const GenerateModal = ({
  visible,
  setVisible,
  translationRequestType = TranslationRequestType.VIDEO_SHARE,
}: GenerateModalProps) => {
  const modalTexts = getModalTexts(translationRequestType);

  return (
    <IonModal
      isOpen={visible}
      className="generate-modal"
      onIonModalDidDismiss={() => setVisible(false)}
      canDismiss
      backdropDismiss={false}>
      <h1>{modalTexts.title}</h1>
      <h2>{modalTexts.description}</h2>
      <IonSpinner className="generate-modal-spinner" name="crescent" />
    </IonModal>
  );
};

export default GenerateModal;
