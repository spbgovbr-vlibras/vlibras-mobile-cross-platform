import { IonModal, IonText, IonChip, IonTextarea } from '@ionic/react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { IconCloseCircle } from 'assets';
import SuggestionFeedbackModal from 'components/SuggestionFeedbackModal';
import { FIRST_PAGE_INDEX } from 'constants/pagination';
import { PlayerKeys } from 'constants/player';
import { regex } from 'constants/types';
import { useTranslation } from 'hooks/Translation';
import { Words } from 'models/dictionary';
import { sendReview } from 'services/suggestionGloss';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators as CreatorsDictionary } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

interface RevisionModalProps {
  show: boolean;
  setShow: any;
  showSuggestionFeedbackModal: boolean;
  setSuggestionFeedbackModal: any;
  isPlaying: boolean;
  onSubmittedRevision?: () => void;
}

const playerService = PlayerService.getPlayerInstance();

const RevisionModal = ({
  show,
  setShow,
  showSuggestionFeedbackModal,
  setSuggestionFeedbackModal,
  isPlaying,
  onSubmittedRevision,
}: RevisionModalProps) => {
  const { textPtBr, textGloss } = useTranslation();
  // Aux var for the TextArea value
  const [auxValueText, setAuxValueText] = useState(textGloss);
  const [firstEntry, setFirstEntry] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const dispatch = useDispatch();

  const handleCloseModal = () => {
    setShow(false);
    setIsPreview(false);
    setAuxValueText('');
    setFirstEntry(true);
  };

  const handlePlaySuggestionGlosa = () => {
    setShow(false);
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.PLAY_NOW,
      auxValueText
    );
    setIsPreview(true);
  };

  const handleOpenSuggestionFeedbackModal = async () => {
    handleCloseModal();
    setSuggestionFeedbackModal(true);
    if (onSubmittedRevision) {
      onSubmittedRevision();
    }

    await sendReview({
      text: textPtBr,
      translation: textGloss,
      review: auxValueText,
      rating: 'bad',
    });

    setAuxValueText('');
  };

  const dictionary = useSelector(
    ({ dictionaryReducer }: RootState) => dictionaryReducer.words
  );

  const handleWordSuggestion = useCallback(
    (word: string) => {
      const text = auxValueText.split(' ');
      text.pop();
      const gloss = text.join(' ').concat(` ${word}`);

      // setTextGloss(gloss, false);
      setAuxValueText(gloss);
    },
    [auxValueText]
  );

  const renderWord = (item: Words) => (
    <div className="revision-modal-word-item">
      <IonChip
        className="suggestion-chips"
        onClick={() => handleWordSuggestion(item.name)}
        key={item.name}>
        {item.name}
      </IonChip>
    </div>
  );

  useEffect(() => {
    if (show && firstEntry) {
      // Setting TextArea value with the current translator
      setAuxValueText(textGloss);
      setFirstEntry(false);
      const searchText = textGloss.toString().split(' ').pop();
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: 10,
          name: `${searchText}%`,
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, dispatch, auxValueText]);

  useEffect(() => {
    if (!isPlaying && isPreview) {
      setShow(true);
    }
  }, [isPlaying, isPreview, setShow]);

  const onSearch = useCallback(
    (event) => {
      setAuxValueText(event.target.value || '');

      const searchText = (event.target.value || '').split(' ').pop();
      dispatch(
        CreatorsDictionary.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: 10,
          name: `${searchText}%`,
        })
      );
    },
    [dispatch, setAuxValueText]
  );

  return (
    <div>
      <IonModal
        isOpen={show}
        className="revision-modal"
        onIonModalDidDismiss={() => setShow(false)}
        canDismiss>
        <div className="revision-modal-header">
          <div style={{ width: 10 }} />
          <div>
            <h1 className="revision-modal-title">Revisão</h1>
          </div>
          <button
            className="revision-close-button"
            type="button"
            onClick={handleCloseModal}>
            <IconCloseCircle color="#1447A6" />
          </button>
        </div>
        <div className="text-area-container">
          <IonText className="text-area-title">
            {Strings.TEXT_AREA_TITLE}
          </IonText>
          <IonTextarea
            className="text-area"
            placeholder="Digite aqui..."
            rows={5}
            cols={5}
            wrap="soft"
            required
            onIonInput={onSearch}
            value={auxValueText}
          />
          <div className="suggestion-container">
            <IonText className="suggestion-text-header">
              {Strings.SUGGESTION_BOX_HEADER}
            </IonText>
          </div>
          <div className="suggestion-chips-box">
            <div className="revision-modal-suggestion-words-list">
              {dictionary.map((item) => renderWord(item))}
            </div>
          </div>
          <div className="chip-area">
            <IonChip
              className="chip-1"
              disabled={
                auxValueText.toString().trim().length === 0 || !regex.test(auxValueText)
              }
              onClick={handlePlaySuggestionGlosa}>
              {Strings.CHIP_TEXT_1}
            </IonChip>
            <IonChip
              className="chip-2"
              disabled={
                auxValueText.toString().trim().length === 0 || !regex.test(auxValueText)
              }
              onClick={handleOpenSuggestionFeedbackModal}>
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
