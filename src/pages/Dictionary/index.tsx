import React, { useCallback, useEffect, useRef, useState } from 'react';

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

type DictionaryFilter = 'alphabetical' | 'recents';

const playerService = PlayerService.getService();

const TIME_DEBOUNCE_MS = 1000;

function getChipClassName(
  filter: DictionaryFilter,
  expected: DictionaryFilter,
) {
  return filter === expected
    ? { color: '#1447a6', background: '#D6E5F9', fontWeight: 'bold' }
    : { color: '#4b4b4b', background: '#ededed' };
}

function Dictionary() {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<DictionaryFilter>('alphabetical');
  const location = useLocation();

  const dispatch = useDispatch();

  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);

  const { metadata, words: dictionary } = useSelector(
    ({ dictionaryReducer }: RootState) => dictionaryReducer,
  );

  const history = useHistory();

  const { setTextGloss, recentTranslation } = useTranslation();

  function translate(text: string) {
    setTextGloss(text, true);
    history.replace(paths.HOME);
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

  const renderRecents = (item: string) => (
    <IonItem
      key={item}
      class="dictionary-word-item"
      onClick={() => translate(item)}
    >
      <IonText class="dictionary-words-style">{item}</IonText>
    </IonItem>
  );

  const onSearch = useCallback(
    event => {
      setSearchText(event.target.value || '');
      dispatch(
        Creators.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: MAX_PER_PAGE,
          name: `${event.target.value}%`,
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
        name: `${searchText}%`,
      }),
    );
    infiniteScrollRef.current?.complete();
  }, [dispatch, infiniteScrollRef, metadata, searchText]);

  function handleFilterAlpha() {
    setFilter('alphabetical');
  }

  function handleFilterRecents() {
    setFilter('recents');
  }

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
            <IonChip
              class="dictionary-container-ion-chips-suggestions"
              onClick={handleFilterAlpha}
              style={getChipClassName(filter, 'alphabetical')}
            >
              {Strings.CHIP_TEXT_SUGGESTIONS_1}
            </IonChip>
            <IonChip
              class="dictionary-container-ion-chips-suggestions"
              onClick={handleFilterRecents}
              style={getChipClassName(filter, 'recents')}
            >
              {Strings.CHIP_TEXT_SUGGESTIONS_2}
            </IonChip>
          </div>
          <div className="dictionary-words-container">
            <IonList lines="none" class="dictionary-words-list">
              {filter === 'alphabetical'
                ? dictionary.map(item => renderWord(item))
                : recentTranslation
                    .filter(item => item.includes(searchText.toUpperCase()))
                    .map(item => renderRecents(item))}
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
