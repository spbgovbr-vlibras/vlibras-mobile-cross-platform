/* eslint-disable prefer-const */
import {
  IonChip,
  IonContent,
  IonItem,
  IonList,
  IonSearchbar,
  IonText,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  useIonViewWillEnter,
  IonImg,
} from '@ionic/react';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

import LoadingSpinner from 'components/LoadingSpinner';
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
import { Creators, ErrorDictionaryRequest } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

type DictionaryFilter = 'alphabetical' | 'recents';

const playerService = PlayerService.getPlayerInstance();

const TIME_DEBOUNCE_MS = 200;

function getChipClassName(
  filter: DictionaryFilter,
  expected: DictionaryFilter
) {
  return filter === expected
    ? { color: '#1447a6', background: '#D6E5F9', fontWeight: 'bold' }
    : { color: '#4b4b4b', background: '#ededed' };
}

function Dictionary() {
  const [searchText, setSearchText] = useState('');
  const [filter, setFilter] = useState<DictionaryFilter>('alphabetical');
  const dispatch = useDispatch();

  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);

  const {
    metadata,
    words: dictionary,
    regionalismWords,
    loading,
    error,
  } = useSelector(({ dictionaryReducer }: RootState) => dictionaryReducer);
  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );

  const history = useHistory();

  const { setTextGloss, recentTranslation } = useTranslation();

  useIonViewWillEnter(() => {
    dispatch(
      currentRegionalism.abbreviation !== 'BR'
        ? Creators.fetchRegionalismWords.request({
            abbrreviation: currentRegionalism.abbreviation,
          })
        : Creators.clearRegionalismWords()
    );
  }, [dispatch, currentRegionalism.abbreviation]);

  function translate(text: string) {
    setTextGloss(text, true);
    history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  const formattedGloss = (gloss: string) => {
    return gloss.indexOf('&') > -1 ? gloss.replace('&', '(') + ')' : gloss;
  };

  const renderWord = (item: Words) => (
    <IonItem
      key={item.id}
      className="dictionary-word-item"
      onClick={() => translate(item.name)}>
      <IonText className="dictionary-words-style">
        {formattedGloss(item.name)}
      </IonText>
    </IonItem>
  );

  const renderRecents = (item: string) => (
    <IonItem
      key={item}
      className="dictionary-word-item"
      onClick={() => translate(item)}>
      <IonText className="dictionary-words-style">
        {formattedGloss(item)}
      </IonText>
    </IonItem>
  );

  const renderOnRegionalism = (item: string) => (
    <>
      <IonItem
        key={item + '/regionalism'}
        className="dictionary-word-item"
        onClick={() => translate(item)}>
        <IonText className="dictionary-words-style">{item}</IonText>
      </IonItem>
      {item !== '' ? <div className="divider"></div> : null}
    </>
  );

  const renderEmptyOrLoadingState = () => {
    if (dictionary.length === 0 && filter === 'alphabetical') {
      if (error) {
        return (
          <div className="dictionary-word-item centered">
            {error === ErrorDictionaryRequest.INTERNET_CONNECTION
              ? Strings.DICTIONARY_INTERNET_CONNECTION_ERROR
              : Strings.DICTIONARY_REQUEST_ERROR}
          </div>
        );
      } else if (loading) {
        return <LoadingSpinner loadingDescription="Carregando sinais..." />;
      } else {
        return (
          <div className="dictionary-word-item centered">
            {Strings.DICTIONARY_WORD_NOT_FOUND}
          </div>
        );
      }
    }
    return null;
  };

  const onSearch = useCallback(
    (event) => {
      const searchedWord: string | undefined = event.target.value;
      setSearchText(searchedWord || '');
      dispatch(
        Creators.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: MAX_PER_PAGE,
          ...((searchedWord?.length || 0) > 0 && {
            name: `${searchedWord}%`,
          }),
        })
      );
    },
    [dispatch]
  );

  const debouncedSearch = debounce(onSearch, TIME_DEBOUNCE_MS);

  useEffect(() => {
    if (!loading) {
      infiniteScrollRef.current?.complete();
    }
  }, [infiniteScrollRef, loading]);

  useEffect(() => {
    dispatch(
      Creators.fetchWords.request({
        page: FIRST_PAGE_INDEX,
        limit: MAX_PER_PAGE,
      })
    );
  }, [dispatch]);

  const fetchWords = useCallback(() => {
    dispatch(
      Creators.fetchWords.request({
        page: metadata.current_page + PAGE_STEP_SIZE,
        limit: MAX_PER_PAGE,
        ...(searchText.length > 0 && {
          name: `${searchText}%`,
        }),
      })
    );
  }, [dispatch, infiniteScrollRef, metadata, searchText]);

  function handleFilterAlpha() {
    setFilter('alphabetical');
  }

  function handleFilterRecents() {
    setFilter('recents');
  }

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode={'back'}>
      <IonContent>
        <div className="dictionary-container">
          <div className="dictionary-box">
            <IonSearchbar
              className="dictionary-textarea"
              placeholder={Strings.TEXT_PLACEHOLDER}
              onIonInput={debouncedSearch}
              inputmode="text"
              searchIcon="search-sharp"
            />
          </div>
          <div className="dictionary-container-ion-chips">
            <IonChip
              className="dictionary-container-ion-chips-suggestions"
              onClick={handleFilterAlpha}
              style={getChipClassName(filter, 'alphabetical')}>
              {Strings.CHIP_TEXT_SUGGESTIONS_1}
            </IonChip>
            <IonChip
              className="dictionary-container-ion-chips-suggestions"
              onClick={handleFilterRecents}
              style={getChipClassName(filter, 'recents')}>
              {Strings.CHIP_TEXT_SUGGESTIONS_2}
            </IonChip>
            {currentRegionalism.abbreviation !== 'BR' && (
              <IonChip className="dictionary-container-ion-chips-abbreviation disabled-chip-abbreviation">
                {currentRegionalism.url.length > 0 && (
                  <IonImg src={currentRegionalism.url} />
                )}
              </IonChip>
            )}
          </div>
          <div className="dictionary-words-container">
            <IonList lines="none" className="dictionary-words-list">
              {regionalismWords.length > 0 && filter === 'alphabetical'
                ? regionalismWords.map((item) => renderOnRegionalism(item))
                : null}

              {filter === 'alphabetical'
                ? dictionary.map((item) => renderWord(item))
                : recentTranslation
                    .filter((item) => item.includes(searchText.toUpperCase()))
                    .map((item) => renderRecents(item))}

              {renderEmptyOrLoadingState()}

              {recentTranslation.length === 0 && filter !== 'alphabetical' ? (
                <div className="dictionary-word-item">
                  Nenhuma pesquisa recente
                </div>
              ) : null}
            </IonList>
          </div>
        </div>
        {metadata.hasNextPage && (
          <IonInfiniteScroll
            ref={infiniteScrollRef}
            threshold="100px"
            onIonInfinite={fetchWords}>
            <IonInfiniteScrollContent
              loadingSpinner={loading ? 'bubbles' : undefined}
              color="dark"
              loadingText={loading ? 'Carregando sinais...' : ''}
            />
          </IonInfiniteScroll>
        )}
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
