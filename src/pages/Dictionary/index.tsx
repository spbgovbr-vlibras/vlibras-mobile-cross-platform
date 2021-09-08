import React, { useCallback, useEffect, useRef } from 'react';

import {
  IonChip,
  IonContent,
  IonItem,
  IonList,
  IonSearchbar,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/react';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

import {
  FIRST_PAGE_INDEX,
  MAX_PER_PAGE,
  PAGE_STEP_SIZE,
} from 'constants/pagination';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import { MenuLayout } from 'layouts';
import { Words } from 'models/dictionary';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

const playerService = PlayerService.getService();

const TIME_DEBOUNCE_MS = 1000;

function Dictionary() {
  const location = useLocation();

  const dispatch = useDispatch();

  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);

  const { metadata, words: dictionary } = useSelector(
    ({ dictionaryReducer }: RootState) => dictionaryReducer,
  );

  const history = useHistory();

  const { setTranslateText } = useTranslation();

  function translate(text: string) {
    setTranslateText(text);
    history.push(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  const renderWord = (item: Words) => (
    <IonItem
      key={item.id}
      class="dictionary-word-item"
      onClick={() => translate(item.name)}
    >
      <IonText class="dictionary-words-style">{item.name}</IonText>
    </IonItem>
  );

  const onSearch = useCallback(
    event => {
      dispatch(
        Creators.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: MAX_PER_PAGE,
          name: event.target.value || undefined,
        }),
      );
    },
    [dispatch],
  );

  const debouncedSearch = debounce(onSearch, TIME_DEBOUNCE_MS);

  useEffect(() => {
    dispatch(
      Creators.fetchWords.request({
        page: FIRST_PAGE_INDEX,
        limit: MAX_PER_PAGE,
      }),
    );
  }, [dispatch]);

  const fetchWords = useCallback(() => {
    dispatch(
      Creators.fetchWords.request({
        page: metadata.current_page + PAGE_STEP_SIZE,
        limit: MAX_PER_PAGE,
      }),
    );
    infiniteScrollRef.current?.complete();
  }, [dispatch, infiniteScrollRef, metadata]);

  return (
    <MenuLayout
      title={Strings.TOOLBAR_TITLE}
      mode={location.pathname === paths.DICTIONARY ? 'menu' : 'back'}
    >
      <IonContent>
        <div className="dictionary-container">
          <div className="dictionary-box">
            <IonSearchbar
              className="dictionary-textarea"
              placeholder={Strings.TEXT_PLACEHOLDER}
              onIonChange={debouncedSearch}
              inputmode="text"
              searchIcon="none"
            />
          </div>
          <div className="dictionary-container-ion-chips">
            <IonChip class="dictionary-container-ion-chips-suggestions-1">
              {Strings.CHIP_TEXT_SUGGESTIONS_1}
            </IonChip>
            <IonChip class="dictionary-container-ion-chips-suggestions-2">
              {Strings.CHIP_TEXT_SUGGESTIONS_2}
            </IonChip>
          </div>
          <div className="dictionary-words-container">
            <IonList lines="none" class="dictionary-words-list">
              {dictionary.map(item => renderWord(item))}
            </IonList>
          </div>
        </div>
        <IonInfiniteScroll
          ref={infiniteScrollRef}
          threshold="100px"
          onIonInfinite={fetchWords}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Carregando sinais..."
          />
        </IonInfiniteScroll>
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
