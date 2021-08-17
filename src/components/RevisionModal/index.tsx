import React, { useEffect, useState } from 'react';
import { IconClose, IconCloseCircle, IconThumbDown } from 'assets';
import {
  IonModal,
  IonButton,
  IonText,
  IonChip,
  IonSearchbar,
  IonTextarea,
} from '@ionic/react';
import './styles.css';
import { Strings } from './strings';
import handleGetText from '../../pages/Translator';
import { text } from 'ionicons/icons';
import { Creators } from 'store/ducks/translator';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'ionicons/dist/types/stencil-public-runtime';
import { RootState } from 'store';

interface RevisionModalProps {
  show: any;
  setShow: any;
}

const RevisionModal = ({ show, setShow }: RevisionModalProps) => {
  const handleOpenModal = () => {
    setShow(true);
  };

  const dispatch = useDispatch();
  const currentTranslatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText,
  );

  return (
    <div>
      <IonModal
        isOpen={show}
        cssClass={'revision-modal'}
        onDidDismiss={() => setShow(false)}
        swipeToClose={true}
      >
        <div className="revision-modal-header">
          <IonText class="revision-modal-title">Revisão</IonText>
          <button
            className="revision-close-button"
            type="button"
            onClick={() => {
              setShow(false);
              console.log('NO MODAL:' + show);
            }}
          >
            <IconCloseCircle color="#1447A6" />
          </button>
        </div>
        <div className="text-area-container">
          <IonText class="text-area-title">{Strings.TEXT_AREA_TITLE}</IonText>
          <IonTextarea
            class="text-area"
            placeholder={Strings.TEXT_PLACEHOLDER}
            autofocus
            rows={5}
            cols={5}
            wrap="soft"
            required
            value={currentTranslatorText}
          ></IonTextarea>
          <div className="suggestion-box">
            <IonText className="suggestion-box-header">
              {Strings.SUGGESTION_BOX_HEADER}
            </IonText>
            <button
              className="suggestion-box-close-button"
              type="button"
              onClick={() => {
                console.log('close suggestion box');
              }}
            >
              <IconClose color="#FFF" size={13} />
            </button>
          </div>
          <div className="chip-area">
            <IonChip class="chip-1">{Strings.CHIP_TEXT_1}</IonChip>
            <IonChip class="chip-2">{Strings.CHIP_TEXT_2}</IonChip>
          </div>
        </div>
      </IonModal>
    </div>
  );
};

export default RevisionModal;
