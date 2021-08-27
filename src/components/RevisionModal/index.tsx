import React, { useCallback, useEffect, useState } from 'react';
import { IconClose, IconCloseCircle, IconThumbDown } from 'assets';
import {
  IonModal,
  IonButton,
  IonText,
  IonChip,
  IonSearchbar,
  IonTextarea,
  IonItem,
  IonList,
  IonSlide,
  IonSlides,
} from '@ionic/react';
import './styles.css';
import { Strings } from './strings';
import handleGetText from '../../pages/Translator';
import { text } from 'ionicons/icons';
import { Creators } from 'store/ducks/translator';
import { Creators as CreatorsDictionary } from 'store/ducks/dictionary';
import { useDispatch, useSelector } from 'react-redux';
import { State } from 'ionicons/dist/types/stencil-public-runtime';
import { RootState } from 'store';
import { Words } from 'models/dictionary';
import { debounce } from 'lodash';
import { current } from 'immer';
import PlayerService from 'services/unity';
import { PlayerKeys } from 'constants/player';
import SuggestionFeedbackModal from 'components/SuggestionFeedbackModal';

interface RevisionModalProps {
  show: boolean;
  setShow: any;
  showSuggestionFeedbackModal: boolean;
  setSuggestionFeedbackModal: any;
}

const RevisionModal = ({
  show,
  setShow,
  showSuggestionFeedbackModal,
  setSuggestionFeedbackModal,
}: RevisionModalProps) => {
  const handleOpenModal = () => {
    setShow(true);
  };

  const handlePlaySuggestionGlosa = () => {
    setShow(false);
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.PLAY_NOW,
      auxValueText,
    );
  };

  const handleOpenSuggestionFeedbackModal = () => {
    setShow(false);
    setSuggestionFeedbackModal(true);
  };
  const playerService = PlayerService.getService();

  const TIME_DEBOUNCE_MS = 0;
  const dispatch = useDispatch();
  const currentTranslatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText,
  );

  //Aux var for the TextArea value
  const [auxValueText, setAuxValueText] = useState('');

  const dictionary = useSelector(
    ({ dictionaryReducer }: RootState) => dictionaryReducer.words,
  );
  const renderWord = (item: Words) => (
    <div className="revision-modal-word-item">
      <IonChip
        class="suggestion-chips"
        onClick={() => setAuxValueText(item.name)}
      >
        {item.name}
      </IonChip>
    </div>
  );

  useEffect(() => {
    //Setting TextArea value with the current translator
    setAuxValueText(currentTranslatorText);
    if (show) {
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: 1,
          limit: 10,
          name: currentTranslatorText,
        }),
      );
    }
  }, [show]);

  const onSearch = useCallback(
    event => {
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: 1,
          limit: 10,
          name: currentTranslatorText,
        }),
      );
    },
    [dispatch, currentTranslatorText],
  );

  const debouncedSearch = debounce(onSearch, TIME_DEBOUNCE_MS);

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
            placeholder={auxValueText}
            autofocus
            rows={5}
            cols={5}
            wrap="soft"
            required
            value={auxValueText}
          ></IonTextarea>
          <div className="suggestion-container">
            <IonText className="suggestion-text-header">
              {Strings.SUGGESTION_BOX_HEADER}
            </IonText>
          </div>
          <div className="suggestion-chips-box">
            <div className="revision-modal-suggestion-words-list">
              {dictionary.map(item => renderWord(item))}
            </div>
          </div>
          <div className="chip-area">
            <IonChip class="chip-1" onClick={handlePlaySuggestionGlosa}>
              {Strings.CHIP_TEXT_1}
            </IonChip>
            <IonChip class="chip-2" onClick={handleOpenSuggestionFeedbackModal}>
              {Strings.CHIP_TEXT_2}
            </IonChip>
          </div>
        </div>
      </IonModal>
      <SuggestionFeedbackModal
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setShowSuggestionFeedbackModal={setSuggestionFeedbackModal}
      ></SuggestionFeedbackModal>
    </div>
  );
};

export default RevisionModal;
