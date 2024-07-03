import { IonModal, IonChip } from '@ionic/react';
import React from 'react';

import './styles.css';
import { IconArrowUpRight, IconCloseCircle } from 'assets';

import { Strings } from './strings';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EmptyRegionalismModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const handleCloseModal = () => {
    onClose();
  };

  const handleOpenWikilibrasSite = () => {
    window.open('https://wiki.vlibras.gov.br', '_system', 'location=yes');
  };
  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={handleCloseModal}
      className="regionalism-modal">
      <div className="regionalism-modal-container-close-button-container">
        <button type="button" onClick={handleCloseModal}>
          <IconCloseCircle color="#4E4E4E" />
        </button>
      </div>
      <h1>{Strings.TITLE_MENU_MODAL_REGIONALISM}</h1>
      <p>{Strings.TEXT_INFORMATION_REGIONALISM}</p>

      <IonChip className="wikilibras-chip" onClick={handleOpenWikilibrasSite}>
        <span className="chip-text-space">{Strings.CHIP_TEXT_REGIONALISM}</span>
        <IconArrowUpRight />
      </IonChip>
      <p>{Strings.SUBTEXT_INFORMATION_REGIONALISM}</p>
    </IonModal>
  );
};

export default EmptyRegionalismModal;
