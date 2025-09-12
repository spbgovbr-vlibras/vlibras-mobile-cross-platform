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
import { chevronBack, chevronDown, chevronUp } from 'ionicons/icons';
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
import { DictionaryData } from 'services/types';
import PlayerService from 'services/unity';
import { getDictionaryData } from 'services/wiktionary';
import { RootState } from 'store';
import { Creators, ErrorDictionaryRequest } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

export type DictionaryFilter = 'categories' | 'alphabetical' | 'recents';

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
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState('');
  const initialFilter = (queryParams.get('filter') as DictionaryFilter) || 'categories';
  const [filter, setFilter] = useState<DictionaryFilter>(initialFilter);
  const [expandedVerb, setExpandedVerb] = useState<string | null>(null);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [wordMeanings, setWordMeanings] = useState<Record<string, Partial<DictionaryData> | null>>({});
  const [loadingMeaning, setLoadingMeaning] = useState<string | null>(null);
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
    const dictionaryState = {
      filter,
      searchText,
      expandedWord,
      expandedVerb,
      visibleVerbCount,
      category,
    };
    sessionStorage.setItem('dictionaryState', JSON.stringify(dictionaryState));
    if (text === '%') text = '%25';
    setTextGloss(text, true);
    history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  async function toggleWordMeaning(word: Words) {
    const wordName = word.name;
    if (expandedWord === wordName) {
      setExpandedWord(null);
      return;
    }

    setExpandedWord(wordName);

    if (wordMeanings[wordName]) {
      return; // Already fetched
    }

    setLoadingMeaning(wordName);
    const meaning = await getDictionaryData(wordName);
    setWordMeanings(prev => ({ ...prev, [wordName]: meaning }));
    setLoadingMeaning(null);
  }

  const formattedGloss = (gloss: string) => {
    return gloss.indexOf('&') > -1 ? gloss.replace('&', '(') + ')' : gloss;
  };

  function clearUrlParams() {
    const params = new URLSearchParams(location.search);
    params.delete('filter');
    params.delete('category');
    history.replace({ search: params.toString() });
    setVisibleVerbCount(VERB_COUNT);
  }

  const renderWord = (item: Words) => {
    const isExpanded = expandedWord === item.name;
    const meaning = wordMeanings[item.name];
    const isLoading = loadingMeaning === item.name;

    return (
      <div key={item.id}>
        <IonItem
          className="dictionary-word-item"
          onClick={() => translate(item.name)}
        >
          <IonText className="dictionary-words-style">
            {formattedGloss(item.name)}
          </IonText>
          <IonIcon
            icon={isExpanded ? chevronUp : chevronDown}
            slot="end"
            className="verb-dropdown-icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleWordMeaning(item);
            }}
          />
        </IonItem>
        {isExpanded && (
          <div className="word-meaning-container">
            {isLoading &&
            <div style={{padding: '16px'}}><LoadingSpinner loadingDescription="Buscando significado..." /></div>}
            {meaning && meaning.definitions && meaning.definitions.length > 0 && (
              <div className="meaning-content">
                <ol>
                  {meaning.definitions.slice(0, 3).map((def, i) => <li key={i}>{def.split('§')[0]}</li>)}
                </ol>
              </div>
            )}
            {!isLoading && (!meaning || !meaning.definitions || meaning.definitions.length === 0) && (
              <div className="meaning-content not-found">Significado não encontrado.</div>
            )}
            <div className="meaning-actions">
              <IonButton
                fill="outline"
                onClick={() => {
                  const firstDef = meaning?.definitions?.[0];
                  if (firstDef) {
                    translate(firstDef.split('§')[0]);
                  }
                }}
              >
                Traduzir em LIBRAS
              </IonButton>
            </div>
          </div>
        )}
        <div className="words-list-popover-content-divider" />
      </div>
    );
  };

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

  const renderAllWords = () => (
    <>
      {wordsJson
        .filter((item) => !item.categorias.includes('Verbos'))
        .map((item, index) => renderWord({id: index, name: item.palavra}))}
      {renderVerbs()}
    </>
  );

  function handleVerbClick(verb: string) {
    if (expandedVerb === verb) {
      setExpandedVerb(null);
    } else {
      setExpandedVerb(verb);
    }
  }

  const renderVerbs = () => {
    return verbList.slice(0, visibleVerbCount).map(([verb, words]) => {
      const isExpanded = expandedVerb === verb;
      return (
        <div key={verb} className="verb-group">
          <IonItem
            lines="none"
            className="dictionary-word-item verb-header"
            // onClick={() => handleVerbClick(verb)}
            >
            <IonText className="dictionary-words-style" onClick={() => translate(verb)}>{verb}</IonText>
            {words.length > 0 &&
              <IonIcon icon={isExpanded ? chevronUp : chevronDown} slot="end" className="verb-dropdown-icon"
                     onClick={() => handleVerbClick(verb)}/>}
          </IonItem>
          {isExpanded && (
            <IonList lines="none" className="dictionary-words-list conjugation-list">
              {words.map((w, i) => {
                return (
                  <IonItem key={`${verb}-form-${i}`}
                           className="dictionary-word-item conjugation-item"
                           onClick={() => translate(w.original)}>
                    <IonText className="dictionary-words-style">{w.transformed}</IonText>
                  </IonItem>
                );
              })}
            </IonList>
          )}
          <div className="words-list-popover-content-divider" />
        </div>
      );
    });
  };
  const handleLoadMoreVerbs = (event: CustomEvent<void>) => {
    setVisibleVerbCount(prev => {
      const newCount = prev + 20;
      return Math.min(newCount, verbList.length);
    });
    (event.target as HTMLIonInfiniteScrollElement).complete();
  };

  type VerbConjugation = {
    original: string;
    transformed: string;
  };
  type VerbGroups = Record<string, VerbConjugation[]>;
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
  const verbRegex = /^(1S_|2S_|3S_|1P_|2P_|3P_)?([A-ZÇÕÂÊÍÓÚ]+)(_1S|_2S|_3S|_1P|_2P|_3P)?$/;

  const transformedCache: Record<string, string> = {};
  for (const p in prefixMap) {
    for (const s in suffixMap) {
      transformedCache[`${p}|${s}`] = `${prefixMap[p]} PARA ${suffixMap[s]}`;
    }
  }

  function groupVerbs(words: Words[]): VerbGroups {
    const acc: VerbGroups = {};
    for (const word of words) {
      const match = word.name.match(verbRegex);

      if (match) {
        const prefix = match[1] || '';
        const verb = match[2];
        const suffix = match[3] || '';

        const prefixText = prefixMap[prefix] || '';
        const suffixText = suffixMap[suffix] || '';

        if (!acc[verb]) acc[verb] = [];
        if(prefixText && suffixText) {
          const transformed = (prefixText && suffixText) ? transformedCache[`${prefix}|${suffix}`] : '';
          acc[verb].push({ original: word.name, transformed });
        }
      }

    }
    const verbGroups = acc;

    const conjugationOrder = [
      'EU PARA MIM',
      'EU PARA VOCÊ',
      'EU PARA ELE(A)',
      'EU PARA NÓS',
      'EU PARA VOCÊS',
      'EU PARA ELES(AS)',
      'VOCÊ PARA MIM',
      'VOCÊ PARA VOCÊ',
      'VOCÊ PARA ELE(A)',
      'VOCÊ PARA NÓS',
      'VOCÊ PARA VOCÊS',
      'VOCÊ PARA ELES(AS)',
      'ELE(A) PARA MIM',
      'ELE(A) PARA VOCÊ',
      'ELE(A) PARA ELE(A)',
      'ELE(A) PARA NÓS',
      'ELE(A) PARA VOCÊS',
      'ELE(A) PARA ELES(AS)',
      'NÓS PARA MIM',
      'NÓS PARA VOCÊ',
      'NÓS PARA ELE(A)',
      'NÓS PARA NÓS',
      'NÓS PARA VOCÊS',
      'NÓS PARA ELES(AS)',
      'VOCÊS PARA MIM',
      'VOCÊS PARA VOCÊ',
      'VOCÊS PARA ELE(A)',
      'VOCÊS PARA NÓS',
      'VOCÊS PARA VOCÊS',
      'VOCÊS PARA ELES(AS)',
      'ELES(AS) PARA MIM',
      'ELES(AS) PARA VOCÊ',
      'ELES(AS) PARA ELE(A)',
      'ELES(AS) PARA NÓS',
      'ELES(AS) PARA VOCÊS',
      'ELES(AS) PARA ELES(AS)',
    ];

    for (const verb in verbGroups) {
      verbGroups[verb].sort((a, b) => {
        return conjugationOrder.indexOf(a.transformed) - conjugationOrder.indexOf(b.transformed);
      });
    }

    return verbGroups;
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
    clearUrlParams();
    setFilter('alphabetical');
  }

  function handleFilterRecents() {
    clearUrlParams();
    setFilter('recents');
  }

  function handleFilterCategories() {
    clearUrlParams();
    setFilter('categories');
  }
  const [dicTest, setDicTest] = useState<Words[]>([]);
  const [verbGroupsState, setVerbGroupsState] = useState<VerbGroups>({});


  const VERB_COUNT = 20;
  const [visibleVerbCount, setVisibleVerbCount] = useState(VERB_COUNT);
  const verbList = React.useMemo(() => Object.entries(verbGroupsState), [verbGroupsState]);
  const category = queryParams.get('category');

  useEffect(() => {
    const verbs = wordsJson
      .filter(item => item.categorias.includes('Verbos'))
      .map((item, index) => ({ id: index, name: item.palavra }));
    setVerbGroupsState(groupVerbs(verbs));
  }, []);

//   useEffect(() => {
//   if (category && CategoriesList[Number(category)].name === 'Verbos') {
//     const verbs = wordsJson
//       .filter(item => item.categorias.includes('Verbos'))
//       .map((item, index) => ({ id: index, name: item.palavra }));
//     setDicTest(verbs);
//     setVerbGroupsState(groupVerbs(verbs));
//   }
// }, [category]);

  useEffect(() => {
    if (category === 'Verbos') {
      const verbs = wordsJson
        .filter(item => item.categorias.includes('Verbos'))
        .map((item, index) => ({ id: index, name: item.palavra }));
        setDicTest(verbs);
        setVerbGroupsState(groupVerbs(verbs));
    } else {
        const index = Number(category);
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
                ? renderAllWords()
                // ? dictionary.map((item) => renderWord(item))
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
            onIonInfinite={handleLoadMoreVerbs}>
            <IonInfiniteScrollContent
              loadingSpinner={loading ? 'bubbles' : undefined}
              color="dark"
              loadingText={loading ? 'Carregando sinais...' : ''}
            />
          </IonInfiniteScroll>
        )}
        {(filter === 'categories') && CategoriesList[Number(category)].name === 'Verbos'  && (
          <IonInfiniteScroll
            threshold="100px"
            onIonInfinite={handleLoadMoreVerbs}
          >
            <IonInfiniteScrollContent
              loadingSpinner="bubbles"
              loadingText="Carregando mais verbos..."
            />
          </IonInfiniteScroll>
        )}
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
