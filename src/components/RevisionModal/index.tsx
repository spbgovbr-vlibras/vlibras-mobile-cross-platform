import React, { useCallback, useEffect, useState } from 'react';

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
import { current } from 'immer';
import { State } from 'ionicons/dist/types/stencil-public-runtime';
import { text } from 'ionicons/icons';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { IconClose, IconCloseCircle, IconThumbDown } from 'assets';
import SuggestionFeedbackModal from 'components/SuggestionFeedbackModal';
import { FIRST_PAGE_INDEX } from 'constants/pagination';
import { PlayerKeys } from 'constants/player';
import { Words } from 'models/dictionary';
import handleGetText from 'pages/Translator';
import { sendReview } from 'services/suggestionGloss';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators as CreatorsDictionary } from 'store/ducks/dictionary';
import { Creators } from 'store/ducks/translator';

import { Strings } from './strings';

import './styles.css';

interface RevisionModalProps {
  show: boolean;
  setShow: any;
  showSuggestionFeedbackModal: boolean;
  setSuggestionFeedbackModal: any;
  isPlaying: boolean;
}

const playerService = PlayerService.getService();
const TIME_DEBOUNCE_MS = 1000;
const TIME_DEBOUNCE_SUGGESTION = 0;

const RevisionModal = ({
  show,
  setShow,
  showSuggestionFeedbackModal,
  setSuggestionFeedbackModal,
  isPlaying,
}: RevisionModalProps) => {
  // Aux var for the TextArea value
  const [auxValueText, setAuxValueText] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const dispatch = useDispatch();
  const currentTranslatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText,
  );

  const handleOpenModal = () => {
    setShow(true);
  };

  const handleCloseModal = () => {
    setShow(false);
    setIsPreview(false);
  };

  const handlePlaySuggestionGlosa = () => {
    setShow(false);
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.PLAY_NOW,
      auxValueText,
    );
    setIsPreview(true);
  };

  const handleOpenSuggestionFeedbackModal = () => {
    setShow(false);
    setSuggestionFeedbackModal(true);
    sendReview({
      text: currentTranslatorText,
      review: auxValueText,
      rating: 'bad',
    });
  };

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
    // Setting TextArea value with the current translator
    setAuxValueText(currentTranslatorText);
    if (show) {
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: 1,
          limit: 10,
          name: `${currentTranslatorText}%`,
        }),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, dispatch]);

  useEffect(() => {
    if (!isPlaying && isPreview) {
      setShow(true);
    }
  }, [isPlaying, isPreview, setShow]);

  const onSearch = useCallback(
    event => {
      setAuxValueText(event.target.value || '');
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: 10,
          name: `${event.target.value}%`,
        }),
      );
    },
    [dispatch],
  );

  const debouncedSearch = debounce(onSearch, TIME_DEBOUNCE_MS);

  return (
    <div>
      <IonModal
        isOpen={show}
        cssClass="revision-modal"
        onDidDismiss={() => setShow(false)}
        swipeToClose
      >
        <div className="revision-modal-header">
          <div style={{ width: 10 }} />
          <div>
            <h1 className="revision-modal-title">Revisão</h1>
          </div>
          <button
            className="revision-close-button"
            type="button"
            onClick={handleCloseModal}
          >
            <IconCloseCircle color="#1447A6" />
          </button>
        </div>
        <div className="text-area-container">
          <IonText class="text-area-title">{Strings.TEXT_AREA_TITLE}</IonText>
          <IonTextarea
            class="text-area"
            placeholder={auxValueText}
            rows={5}
            cols={5}
            wrap="soft"
            required
            onIonChange={debouncedSearch}
            value={auxValueText}
          />
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
      />
    </div>
  );
};

export default RevisionModal;
