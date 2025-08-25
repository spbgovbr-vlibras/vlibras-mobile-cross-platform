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
  IonButton,
  IonIcon
} from '@ionic/react';
import { chevronBack } from 'ionicons/icons';
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
import CategoriesList from 'data/Categories';
import wordsJson from 'data/classified_words_reduced.json';
import { useTranslation } from 'hooks/Translation';
import { MenuLayout } from 'layouts';
import { Words } from 'models/dictionary';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators, ErrorDictionaryRequest } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

type DictionaryFilter = 'categories' | 'alphabetical' | 'recents';

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
  const [filter, setFilter] = useState<DictionaryFilter>('categories');
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
    if (text === '%') text = '%25';
    setTextGloss(text, true);
    history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  const formattedGloss = (gloss: string) => {
    return gloss.indexOf('&') > -1 ? gloss.replace('&', '(') + ')' : gloss;
  };

  function clearCategoryParam() {
  const params = new URLSearchParams(location.search);
  params.delete('category');
  history.replace({ search: params.toString() });
}

  const renderWord = (item: Words) => (
    <>
      <IonItem
        key={item.id}
        className="dictionary-word-item"
        onClick={() => translate(item.name)}>
        <IonText className="dictionary-words-style">
          {formattedGloss(item.name)}
        </IonText>
      </IonItem>
      <div className="words-popover-content-divider" />
    </>
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

  const renderCategoryHeader = (categoryIndex: number) => (
    <>
      <div className='category-header'>
        <IonItem lines="none" className="dictionary-word-item" onClick={handleFilterCategories}>
          <IonButton fill="clear" slot="start" onClick={handleFilterCategories}>
          <IonIcon icon={chevronBack} />
        </IonButton>
            <IonImg
              src={CategoriesList[categoryIndex].logoUrl}
              style={{ width: '30px', height: '30px', marginRight: '12px' }}
            />
          <IonText className="dictionary-words-style" style={{ fontWeight: 'bold' }}>
            {CategoriesList[categoryIndex].name}
          </IonText>
        </IonItem>
      </div>
    </>
  );

  const renderCategories = (item: {name: string; logoUrl: string; index: number}) => (
    <>
      <IonItem
        className="dictionary-word-item"
        button
        onClick={() => {
          history.push(`?category=${item.index}`);
        }}
      >
        {item.logoUrl && (
          <IonImg
          src={item.logoUrl}
          style={{ width: '25px', height: '25px', marginRight: '20px' }}
          />
        )}
        <IonText className="dictionary-words-style">{item.name}</IonText>
      </IonItem>
      <div className="words-popover-content-divider" />
    </>
  );

  const renderCategoryWords = (index: number) => (
    <>
      {CategoriesList[index].name === 'Verbos' ? renderVerbs() : dicTest.map((item) => renderWord(item))}
    </>
  );

  const renderVerbs = () => {
    const grouped = groupVerbs(dicTest);
    return Object.entries(grouped).map(([verb, words], index) => (
      <IonList key={verb} lines="none" className="dictionary-words-list">
      {/* Cabeçalho do verbo */}
      {renderWord({ name: verb, id: index })}

      {/* Variações do verbo */}
      {words.map((w, i) => (
        <IonItem key={`${verb}-form-${i}`} className="dictionary-word-item" onClick={() => translate(w)}>
          <IonText className="dictionary-words-style">{w}</IonText>
        </IonItem>
      ))}
    </IonList>
    ));
  };

  type VerbGroups = Record<string, string[]>;
  function groupVerbs(words: Words[]): VerbGroups {
    return words.reduce<VerbGroups>((acc, word) => {
      const prefixMap: Record<string, string> = {
        '1S_': 'EU',
        '2S_': 'VOCÊ',
        '3S_': 'ELE(A)',
        '1P_': 'NÓS',
        '2P_': 'VOCÊS',
        '3P_': 'ELES(AS)',
      };
      const suffixMap: Record<string, string> = {
        '_1S': 'MIM',
        '_2S': 'VOCÊ',
        '_3S': 'ELE(A)',
        '_1P': 'NÓS',
        '_2P': 'VOCÊS',
        '_3P': 'ELES(AS)',
      };
      const match = word.name.match(/^(1S_|2S_|3S_|1P_|2P_|3P_)?([A-ZÇÕÂÊÍÓÚ]+)(_1S|_2S|_3S|_1P|_2P|_3P)?$/);

      if (match) {
        const prefix = match[1] || '';
        const verb = match[2];
        const suffix = match[3] || '';

        const prefixText = prefixMap[prefix] ? prefixMap[prefix] + ' ' : '';
        const suffixText = suffixMap[suffix] ? ' ' + suffixMap[suffix] : '';

        const transformed = prefix ? `${prefixText} PARA ${suffixText}` : '';
        if (!acc[verb]) acc[verb] = [];
        acc[verb].push(transformed);
      }

      return acc;
    }, {});
  }

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
            name: `%${searchedWord}%`,
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
    clearCategoryParam();
    setFilter('alphabetical');
  }

  function handleFilterRecents() {
    clearCategoryParam();
    setFilter('recents');
  }

  function handleFilterCategories() {
    clearCategoryParam();
    setFilter('categories');
  }

  const location = useLocation();
  const [dicTest, setDicTest] = useState<Words[]>([]);

  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get('category');

  useEffect(() => {
    if (category) {
      const index = parseInt(category, 10);
      const categoryName = CategoriesList[index].name;
      setDicTest(wordsJson
      .filter(item => item.categorias.includes(categoryName))
      .map((item, index) => {
        return {
          id: index,
          name: item.palavra
        };
      }));
    }
  }, [location.search]);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode={'back'}>
      <IonContent>
        <div className="dictionary-container">
          <div className="sticky-container">
          <div className="dictionary-box">
            <IonSearchbar
              className="dictionary-textarea"
              placeholder={Strings.TEXT_PLACEHOLDER}
              onIonInput={debouncedSearch}
              inputmode="text"
              searchIcon="search-sharp"
              onKeyDown={(e) => {(e.key === 'Enter') ? (e.target as HTMLInputElement).blur() : null;}}
            />
          </div>
          <div className="dictionary-container-ion-chips">
            <IonChip
              className="dictionary-container-ion-chips-suggestions"
              onClick={handleFilterCategories}
              style={getChipClassName(filter, 'categories')}>
              {Strings.CHIP_TEXT_SUGGESTIONS_3}
            </IonChip>
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
            {(searchText && dictionary.length>0) && (
              <IonChip
                style={{ color: '#4b4b4b', background: '#FFFFFF'}}>
                {dictionary.length+' sinais encontrados'}
              </IonChip>
            )}
          </div>
          {category && renderCategoryHeader(Number(category))}
          </div>

          <div className="dictionary-words-container">
            <div className="words-list-popover-content-divider" />
            <IonList lines="none" className="dictionary-words-list">
              {regionalismWords.length > 0 && filter === 'alphabetical'
                ? regionalismWords.map((item) => renderOnRegionalism(item))
                : null}

              {filter === 'alphabetical'
                ? dictionary.map((item) => renderWord(item))
                : filter === 'recents'
                ? recentTranslation
                    .filter((item) => item.includes(searchText.toUpperCase()))
                    .map((item) => renderRecents(item))
                : category
                  ? renderCategoryWords(Number(category))
                  : CategoriesList.map((item, index) => renderCategories({...item, index}))
              }

              {renderEmptyOrLoadingState()}

              {recentTranslation.length === 0 && filter === 'recents' ? (
                <div className="dictionary-word-item">
                  Nenhuma pesquisa recente
                </div>
              ) : null}
            </IonList>
          </div>
        </div>
        {metadata.hasNextPage && (filter !== 'categories') && (
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
