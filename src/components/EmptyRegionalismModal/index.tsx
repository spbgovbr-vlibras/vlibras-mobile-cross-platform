import { IonModal, IonChip } from '@ionic/react';
import React from 'react';
import { useHistory } from 'react-router';

import './styles.css';
import { Strings } from './strings';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmptyRegionalismModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const history = useHistory();
  const handleButtonClick = () => {
    history.goBack();
    onClose();
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleCloseModal}
      className="regionalism-modal">
      <h1>{Strings.TITLE_MENU_MODAL_REGIONALISM}</h1>
      <p>{Strings.TEXT_INFORMATION_REGIONALISM}</p>

      <IonChip className="button" onClick={handleButtonClick}>
        {Strings.TEXT_BUTTON_REGIONALISM}
      </IonChip>
    </IonModal>
  );
};

export default EmptyRegionalismModal;
