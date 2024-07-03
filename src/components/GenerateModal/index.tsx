import { IonModal, IonSpinner } from '@ionic/react';
import { useState, useEffect } from 'react';

import { IconCloseCircle } from 'assets';
import { TranslationRequestType } from 'constants/types';

import { Strings } from './strings';
import './styles.css';

interface GenerateModalProps {
  visible: boolean;
  setVisible: (show: boolean) => void;
  translationRequestType?: TranslationRequestType;
  showCloseButton?: boolean;
  onBreak?: () => void;
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
  showCloseButton,
  onBreak,
}: GenerateModalProps) => {
  const [isCloseButtonVisible, setIsCloseButtonVisible] = useState(false);

  useEffect(() => {
    if (showCloseButton) {
      setTimeout(() => {
        setIsCloseButtonVisible(true);
      }, 50);
    } else {
      setIsCloseButtonVisible(false);
    }
  }, [showCloseButton]);

  const modalTexts = getModalTexts(translationRequestType);

  return (
    <IonModal
      isOpen={visible}
      className="generate-modal"
      onIonModalDidDismiss={() => setVisible(false)}
      canDismiss
      backdropDismiss={false}>
      {showCloseButton && (
        <div
          className={`generate-modal-container-close-button-container ${
            isCloseButtonVisible ? 'fade-in' : ''
          }`}>
          <button type="button" onClick={onBreak}>
            <IconCloseCircle color="#4E4E4E" />
          </button>
        </div>
      )}
      <h1>{modalTexts.title}</h1>
      <h2>{modalTexts.description}</h2>

      <IonSpinner className="generate-modal-spinner" name="crescent" />
    </IonModal>
  );
};

export default GenerateModal;
