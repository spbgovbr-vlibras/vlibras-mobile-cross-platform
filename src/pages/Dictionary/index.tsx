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
  useIonViewDidEnter,
  IonImg,
  IonButton,
  IonIcon
} from '@ionic/react';
import { arrowForward, chevronBack, chevronDown, chevronUp } from 'ionicons/icons';
import { debounce, toNumber } from 'lodash';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

import { IconHandsTranslate } from 'assets';
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
  const [expandedLetter, setExpandedLetter] = useState<string | null>(null);
  const [wordMeanings, setWordMeanings] = useState<Record<string, Partial<DictionaryData> | null>>({});
  const [loadingMeaning, setLoadingMeaning] = useState<string | null>(null);
  const [sortedJson, setSortedJson] = useState<{ palavra: string; categorias: string[] }[]>([]);
  const [scrollTopValue, setscrollTopValue] = useState<number>();
  const dispatch = useDispatch();

  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);

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

  const { setTextGloss, setTextPtBr, recentTranslation } = useTranslation();

  const [dicTest, setDicTest] = useState<Words[]>([]);
  const [verbGroupsState, setVerbGroupsState] = useState<VerbGroups>({});


  const VERB_COUNT = 20;
  const [visibleVerbCount, setVisibleVerbCount] = useState(VERB_COUNT);
  const verbList = React.useMemo(() => Object.entries(verbGroupsState), [verbGroupsState]);
  const category = queryParams.get('category');

useIonViewDidEnter(() => {
  contentRef.current?.getScrollElement().then((el) => {
    const queryParams = new URLSearchParams(window.location.search);
    const scrollParam = queryParams.get('scroll');
    el.scrollTop = toNumber(scrollParam);
    const handler = () => {
      setscrollTopValue(el.scrollTop);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  });
});

  useIonViewWillEnter(() => {
    dispatch(
      currentRegionalism.abbreviation !== 'BR'
        ? Creators.fetchRegionalismWords.request({
            abbrreviation: currentRegionalism.abbreviation,
          })
        : Creators.clearRegionalismWords()
    );
  }, [dispatch, currentRegionalism.abbreviation]);

  async function saveDictionaryState() {
    const scrollTop = scrollTopValue;
    const dictionaryState = {
      filter,
      searchText,
      expandedWord,
      expandedVerb,
      visibleVerbCount,
      category,
      scrollTop,
    };
    sessionStorage.setItem('dictionaryState', JSON.stringify(dictionaryState));
  };


  function translate(text: string) {
    saveDictionaryState();
    if (text === '%') text = '%25';
    setTextGloss(text, true);
    history.push(paths.HOME, { from: 'dictionary' });
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  async function translatePtBr(text: string) {
    saveDictionaryState();
    const gloss = await setTextPtBr(text, false, false);
    history.push(paths.HOME, { from: 'dictionary' });
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
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

  async function toggleVerbMeaning(verbName: string) {
    if (expandedVerb === verbName) {
      setExpandedVerb(null);
      return;
    }

    setExpandedVerb(verbName);

    if (wordMeanings[verbName]) {
      return; // Already fetched
    }

    setLoadingMeaning(verbName);
    const meaning = await getDictionaryData(verbName);
    setWordMeanings(prev => ({ ...prev, [verbName]: meaning }));
    setLoadingMeaning(null);
  }

  function clearUrlParams() {
    const params = new URLSearchParams(location.search);
    params.delete('filter');
    params.delete('category');
    history.replace({ search: params.toString() });
    setVisibleVerbCount(VERB_COUNT);
  }

  const renderMeaningContent = (item: Words) => {
    const isLoading = loadingMeaning === item.name;
    const meaning = wordMeanings[item.name];
    if (isLoading) {
      return <div style={{padding: '16px'}}><LoadingSpinner loadingDescription="Buscando significado..." /></div>;
    }
    if (meaning && meaning.definitions && meaning.definitions.length > 0) {
      return (
        <>
          <div className="verb-section-header">SIGNIFICADO</div>
          <ol className="meaning-content-list">
            {meaning.definitions.slice(0, 3).map((def: string, i: number) => {
              const definitionText = def.split('§')[0];
              return (
                <li key={i}>
                  <span>{`${i + 1}. ${definitionText}`}</span>
                  <button className='translate-def-button' onClick={() => translatePtBr(definitionText)}>
                    <IconHandsTranslate size={20} color={'#1447a6'} />
                  </button>
                </li>
              );
            })}
          </ol>
        </>
      );
    }
    return <div className="meaning-content not-found">Significado não encontrado.</div>;
  };

  const filteredDicTest = dicTest.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  function renderContext(item: Words[]) {
    return (
      <IonList lines="none" className="dictionary-words-list conjugation-list">
      <div className="verb-section-header">CONTEXTO</div>
      {item.map((word, index) => {
        const [mainWord, suffix] = word.name.split('&', 2);
        return (
          <div key={`teste-${index}`} className="desambiguation-section-header">
            <IonItem key={`${suffix}-form-${index}`}
                    className="dictionary-word-item desambiguation-text"
                    onClick={() => translate(word.name)}>
              <div className="desambiguation-text">
                <IonText className="dictionary-words-style">{mainWord} ({suffix})</IonText>
              </div>
            </IonItem>
          </div>
        );
      })}
      </IonList>
    );
  }

  const renderDesambiguateWord = (item: Words[], isLast: boolean) => {
    const name = item[0].name.split('&', 1)[0];
    const id = item[0].id;
    const isExpanded = expandedWord === name;

    return (
      <div key={id}>
        <IonItem
          className={`dictionary-word-item ${isExpanded ? 'word-expanded-header' : ''}`}
          button
          detail={false}
          lines={'none'}
          onClick={() => toggleWordMeaning({name: name, id: id})}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IonText className="dictionary-words-style">
              {formattedGloss(name)}
            </IonText>
            {isExpanded && (
              <button className='translate-def-button' style={{ marginLeft: '10px' }} onClick={(e) => { e.stopPropagation(); translate(name)}}>
                <IconHandsTranslate size={20} color={'#1447a6'} />
              </button>
            )}
          </div>
          <IonIcon
            icon={isExpanded ? chevronUp : chevronDown}
            slot="end"
            className="verb-dropdown-icon"
          />
        </IonItem>
        {isExpanded && (
          <div className="word-meaning-container">
            {renderMeaningContent(item[0])}
            {renderContext(item.slice(item[0].name.includes('&') ? 0 : 1))}
          </div>
        )}
        {!isExpanded && !isLast && <div  key={`divider-${item}`} className="words-list-popover-content-divider" />}
      </div>
    );
  };

  const renderWord = (item: Words, isLast: boolean) => {
    const isExpanded = expandedWord === item.name;

    return (
      <div key={item.id}>
        <IonItem
          className={`dictionary-word-item ${isExpanded ? 'word-expanded-header' : ''}`}
          button
          detail={false}
          lines={'none'}
          onClick={() => toggleWordMeaning(item)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <IonText className="dictionary-words-style">
              {formattedGloss(item.name)}
            </IonText>
            {isExpanded && (
              <button className='translate-def-button' style={{ marginLeft: '10px' }} onClick={(e) => { e.stopPropagation(); translate(item.name)}}>
                <IconHandsTranslate size={20} color={'#1447a6'} />
              </button>
            )}
          </div>
          <IonIcon
            icon={isExpanded ? chevronUp : chevronDown}
            slot="end"
            className="verb-dropdown-icon"
          />
        </IonItem>
        {isExpanded && (
          <div className="word-meaning-container">
            {renderMeaningContent(item)}
          </div>
        )}
        {!isExpanded && !isLast && <div className="words-list-popover-content-divider" />}
      </div>
    );
  };

  const renderRecents = (item: string, isLast: boolean) => (
    <>
      <IonItem
        key={item}
        className="dictionary-word-item"
        onClick={() => translate(item)}
        lines="none"
      >
        <IonText className="dictionary-words-style">
          {formattedGloss(item)}
        </IonText>
      </IonItem>
      {!isLast && <div className="words-list-popover-content-divider" />}
    </>
  );

  const renderOnRegionalism = (item: string) => (
    <>
      <IonItem
        key={item + '/regionalism'}
        className="dictionary-word-item"
        onClick={() => translate(item)}>
        <IonText className="dictionary-words-style">{item}</IonText>
      </IonItem>
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

  const renderCategories = (item: {name: string; logoUrl: string; index: number}, isLast: boolean) => (
    <>
      <IonItem
        className="dictionary-word-item category-item"
        button
        lines={'none'}
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
      {!isLast && <div key={`divider-category-${item.index}`} className="words-list-popover-content-divider" />}
    </>
  );

  const renderCategoryWords = (index: number) => (
    <>
      {CategoriesList[index].name === 'Verbos' ?
        renderVerbs() : renderNoVerbsWords(filteredDicTest)}
    </>
  );

  const renderAllWords = () => {
    // Helper function to group non-verb words, similar to the logic in renderNoVerbsWords
    function groupNonVerbs(words: Words[]) {
      const groups: (Words | Words[])[] = [];
      let i = 0;
      while(i < words.length) {
        const word = words[i];
        if(word.name.includes('&')) {
          const prefix = word.name.split('&', 1)[0];
          const group: Words[] = [];
          while(i < words.length && words[i].name.startsWith(prefix + '&')) {
            group.push(words[i]);
            i++;
          }
          i--;
          groups.push(group);
        } else if(i < words.length-1 && words[i+1].name.includes('&')) {
          const prefix = words[i+1].name.split('&', 1)[0];
          if(prefix === word.name) {
            const group: Words[] = [];
            group.push(word);
            i++;
            while(i < words.length && words[i].name.startsWith(prefix + '&')) {
              group.push(words[i]);
              i++;
            }
            i--;
            groups.push(group);
          } else {
            groups.push(word);
          }
        } else {
          groups.push(word);
        }
        i++;
      }
      return groups;
    }

    const nonVerbWords = sortedJson
      .filter((item) => !item.categorias.includes('Verbos'))
      .filter((item) => item.palavra.toLowerCase().includes(searchText.toLowerCase()))
      .map((item, index) => ({id: index, name: item.palavra}));

    const groupedNonVerbs = groupNonVerbs(nonVerbWords);

    const allItems: { name: string, type: 'verb' | 'word' | 'desambiguation', data: any }[] = [];

    groupedNonVerbs.forEach(item => {
        if (Array.isArray(item)) {
            allItems.push({ name: item[0].name.split('&', 1)[0], type: 'desambiguation', data: item });
        } else {
            allItems.push({ name: item.name, type: 'word', data: item });
        }
    });

    filteredVerbList.forEach(([verb, groups]) => {
        allItems.push({ name: verb, type: 'verb', data: { verb, groups } });
    });

    const groupedByLetter: { [key: string]: typeof allItems } = {};

    allItems.forEach(item => {
        let firstChar = item.name.charAt(0).toUpperCase();
        if (/[0-9]/.test(firstChar)) {
            firstChar = '#';
        }
        if (!groupedByLetter[firstChar]) {
            groupedByLetter[firstChar] = [];
        }
        groupedByLetter[firstChar].push(item);
    });

    const alphabet = '#ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    return alphabet.map(letter => {
        const itemsForLetter = groupedByLetter[letter];
        if (!itemsForLetter || itemsForLetter.length === 0) {
            return null;
        }

        itemsForLetter.sort((a, b) => a.name.localeCompare(b.name));

        const isExpanded = expandedLetter === letter;

        return (
            <div key={letter}>
                <IonItem
                    button
                    detail={false}
                    lines="none"
                    onClick={() => setExpandedLetter(isExpanded ? null : letter)}
                    className="dictionary-word-item"
                >
                    <IonText className="dictionary-words-style">{letter === '#' ? '0..9' : letter}</IonText>
                    <IonIcon
                        icon={isExpanded ? chevronUp : chevronDown}
                        slot="end"
                        className="verb-dropdown-icon"
                    />
                </IonItem>
                {isExpanded && (
                    <div style={{ paddingLeft: '16px' }}>
                        {itemsForLetter.map((item, index) => {
                            const isLast = index === itemsForLetter.length - 1;
                            if (item.type === 'word') {
                                return renderWord(item.data, isLast);
                            }
                            if (item.type === 'desambiguation') {
                                return renderDesambiguateWord(item.data, isLast);
                            }
                            if (item.type === 'verb') {
                                const { verb, groups } = item.data;
                                // Replicating renderVerbs logic for a single item
                                const conjugationWords = groups.conjugation;
                                const desambiguationWords = groups.desambiguation;
                                const isVerbExpanded = expandedVerb === verb;
                                const meaning = wordMeanings[verb];
                                const isLoadingMeaning = loadingMeaning === verb;
                                const slicedWords = conjugationWords.slice(verb === conjugationWords[0]?.original ? 1 : 0);
                                return (
                                  <div key={verb} className="verb-group">
                                    <IonItem
                                      lines={'none'}
                                      className={`dictionary-word-item ${isVerbExpanded ? 'word-expanded-header' : ''}`}
                                      button
                                      detail={false}
                                      onClick={() => toggleVerbMeaning(verb)}
                                      >
                                      <IonText className="dictionary-words-style"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                translate(conjugationWords[0].original)
                                              }}>{verb}</IonText>
                                      <IonIcon icon={isVerbExpanded ? chevronUp : chevronDown}
                                              slot="end"
                                              className="verb-dropdown-icon"
                                              />
                                    </IonItem>
                                    {isVerbExpanded && (
                                      <div className="verb-details-container">
                                        {isLoadingMeaning &&
                                          <div style={{padding: '16px'}}><LoadingSpinner loadingDescription="Buscando significado..." /></div>}
                                        {meaning?.definitions && meaning.definitions.length > 0 && (
                                          <>
                                            <div className="verb-section-header">SIGNIFICADO</div>
                                            <ol className="verb-meaning-list">
                                              {meaning.definitions.slice(0, 2).map((def, i) => {
                                                const definitionText = def.split('§')[0];
                                                return (
                                                  <li key={i}>
                                                    <span>{`${i + 1}. ${definitionText}`}</span>
                                                    <button className='translate-def-button' onClick={() => translatePtBr(definitionText)}>
                                                      <IconHandsTranslate size={18} color={'#1447a6'} />
                                                    </button>
                                                  </li>
                                                );
                                              })}
                                            </ol>
                                          </>
                                        )}
                                        {slicedWords.length > 0 && (
                                        <>
                                          <div className="verb-section-header">CONCORDÂNCIA VERBAL</div>
                                          <IonList lines="none" className="dictionary-words-list conjugation-list">
                                            {slicedWords.map((w: VerbConjugation, i: number) => {
                                              return (
                                                <IonItem key={`${verb}-form-${i}`}
                                                        className="dictionary-word-item conjugation-item"
                                                        onClick={() => translate(w.original)}>
                                                  <div className="conjugation-text-wrapper">
                                                    <IonText className="dictionary-words-style conjugation-part">{w.prefix}</IonText>
                                                    <IonIcon icon={arrowForward} className="conjugation-arrow" />
                                                    <IonText className="dictionary-words-style conjugation-part">{w.suffix}</IonText>
                                                  </div>
                                                </IonItem>
                                              );
                                            })}
                                          </IonList>
                                        </>
                                        )}
                                        {desambiguationWords.length > 0 && renderContext(desambiguationWords)}
                                      </div>
                                    )}
                                    {!isVerbExpanded && !isLast && <div className="words-list-popover-content-divider" />}
                                  </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                )}
                {!isExpanded && <div className="words-list-popover-content-divider" />}
            </div>
        );
    });
  };

  function handleVerbClick(verb: string) {
    if (expandedVerb === verb) {
      setExpandedVerb(null);
    } else {
      setExpandedVerb(verb);
    }
  }

  type VerbConjugation = {
    original: string;
    prefix: string;
    suffix: string;
    transformed: string;
  };
  type VerbGroups = Record<string, {conjugation: VerbConjugation[], desambiguation: Words[]}>;
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
  // const verbRegex = /^(1S_|2S_|3S_|1P_|2P_|3P_)?([A-ZÇÕÂÊÍÓÚ]+)(_1S|_2S|_3S|_1P|_2P|_3P)?$/;

  const verbRegex = new RegExp(
    '^(1S_|2S_|3S_|1P_|2P_|3P_)?'
    +'([A-ZÇÕÂÊÍÓÚ]+(?:_(?![123][SP])[A-ZÇÕÂÊÍÓÚ]+)*)'
    +'(_1S|_2S|_3S|_1P|_2P|_3P)?$'
  );


  const transformedCache: Record<string, string> = {};
  for (const p in prefixMap) {
    for (const s in suffixMap) {
      transformedCache[`${p}|${s}`] = `${prefixMap[p]} PARA ${suffixMap[s]}`;
    }
  }

  function groupVerbs(words: Words[]): VerbGroups {
    const acc: VerbGroups = {};

    for (const word of words) {
      const baseVerb = word.name.includes('&') ?
        word.name.split('&', 1)[0] : word.name.match(verbRegex)?.[2] || word.name;

      if(!acc[baseVerb]) acc[baseVerb] = {conjugation: [], desambiguation: []};

      if(word.name.includes('&')) {
        acc[baseVerb].desambiguation.push(word);
      } else {
        const match = word.name.match(verbRegex);
        if (match) {
          const prefix = match[1] || '';
          const verb = match[2];
          const suffix = match[3] || '';

          const prefixText = prefixMap[prefix] || '';
          const suffixText = suffixMap[suffix] || '';

          if (prefixText && suffixText) {
            const transformed = `${prefixText} PARA ${suffixText}`;
            acc[verb].conjugation.push({ original: word.name,
                                         transformed,
                                         prefix: prefixText,
                                         suffix: suffixText });
          } else {
            acc[verb].conjugation.unshift({ original: word.name,
                                            transformed: word.name,
                                            prefix: prefixText,
                                            suffix: suffixText });
          }
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
      verbGroups[verb].conjugation.sort((a, b) => {
        return conjugationOrder.indexOf(a.transformed) - conjugationOrder.indexOf(b.transformed);
      });
    }

    return verbGroups;
  }

  const filteredVerbList = verbList.filter(([verb]) =>
    verb.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderNoVerbsWords = (words: Words[]) => {
    const elements: JSX.Element[] = [];
    let i = 0;
    while(i < words.length) {
      const word = words[i];
      if(word.name.includes('&')) {
        const prefix = word.name.split('&', 1)[0];
        const group: Words[] = [];

        while(i < words.length && words[i].name.startsWith(prefix + '&')) {
          group.push(words[i]);
          i++;
        }
        i--;
        elements.push(renderDesambiguateWord(group, i === filteredDicTest.length-1));

      } else if(i < words.length-1 && words[i+1].name.includes('&')) {
        const prefix = words[i+1].name.split('&', 1)[0];
        if(prefix === word.name) {
          const group: Words[] = [];
          group.push(word);
          i++;
          while(i < words.length && words[i].name.startsWith(prefix + '&')) {
            group.push(words[i]);
            i++;
          }
          i--;
          elements.push(renderDesambiguateWord(group, i === filteredDicTest.length-1));
        } else {
          elements.push(renderWord(word, i === filteredDicTest.length-1));
        }

      } else {
        elements.push(renderWord(word, i === filteredDicTest.length-1));
      }
      i++;
    }
    return elements;
  };

  const renderVerbs = () => {
    return filteredVerbList.slice(0, visibleVerbCount).map(([verb, groups], i) => {
      const conjugationWords = groups.conjugation;
      const desambiguationWords = groups.desambiguation;
      const isExpanded = expandedVerb === verb;
      const meaning = wordMeanings[verb];
      const isLoadingMeaning = loadingMeaning === verb;
      const isLast = i === filteredVerbList.slice(0, visibleVerbCount).length - 1;
      const slicedWords = conjugationWords.slice(verb === conjugationWords[0]?.original ? 1 : 0);
      return (
        <div key={verb} className="verb-group">
          <IonItem
            lines={'none'}
            className={`dictionary-word-item ${isExpanded ? 'word-expanded-header' : ''}`}
            button
            detail={false}
            onClick={() => toggleVerbMeaning(verb)}
            >
            <IonText className="dictionary-words-style"
                    onClick={(e) => {
                      e.stopPropagation();
                      translate(conjugationWords[0].original)
                    }}>{verb}</IonText>
            <IonIcon icon={isExpanded ? chevronUp : chevronDown}
                     slot="end"
                     className="verb-dropdown-icon"
                     />
          </IonItem>
          {isExpanded && (
            <div className="verb-details-container">
              {isLoadingMeaning &&
                <div style={{padding: '16px'}}><LoadingSpinner loadingDescription="Buscando significado..." /></div>}
              {meaning?.definitions && meaning.definitions.length > 0 && (
                <>
                  <div className="verb-section-header">SIGNIFICADO</div>
                  <ol className="verb-meaning-list">
                    {meaning.definitions.slice(0, 2).map((def, i) => {
                      const definitionText = def.split('§')[0];
                      return (
                        <li key={i}>
                          <span>{`${i + 1}. ${definitionText}`}</span>
                          <button className='translate-def-button' onClick={() => translatePtBr(definitionText)}>
                            <IconHandsTranslate size={18} color={'#1447a6'} />
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}
              {slicedWords.length > 0 && (
              <>
                <div className="verb-section-header">CONCORDÂNCIA VERBAL</div>
                <IonList lines="none" className="dictionary-words-list conjugation-list">
                  {slicedWords.map((w, i) => {
                    return (
                      <IonItem key={`${verb}-form-${i}`}
                              className="dictionary-word-item conjugation-item"
                              onClick={() => translate(w.original)}>
                        <div className="conjugation-text-wrapper">
                          <IonText className="dictionary-words-style conjugation-part">{w.prefix}</IonText>
                          <IonIcon icon={arrowForward} className="conjugation-arrow" />
                          <IonText className="dictionary-words-style conjugation-part">{w.suffix}</IonText>
                        </div>
                      </IonItem>
                    );
                  })}
                </IonList>
              </>
              )}
              {desambiguationWords.length > 0 && renderContext(desambiguationWords)}
            </div>
          )}
          {!isExpanded && !isLast && <div className="words-list-popover-content-divider" />}
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

  const renderEmptyOrLoadingState = () => {
    if (dictionary.length === 0 && filter === 'alphabetical' && searchText) {
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

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (filter === 'alphabetical') {
        dispatch(
          Creators.fetchWords.request({
            page: FIRST_PAGE_INDEX,
            limit: MAX_PER_PAGE,
            ...((searchText?.length || 0) > 0 && {
              name: `${searchText}%`,
            }),
          })
        );
      }
    }, TIME_DEBOUNCE_MS);

    debouncedSearch();

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, filter, dispatch]);

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

  function sortGroupedVerbs(verbs: VerbGroups): VerbGroups {
    return Object.fromEntries(
      Object.entries(verbs).sort(([a], [b])=>a.localeCompare(b))
    );
  }

  function sortWordsWithAndFirst(words: { palavra: string; categorias: string[] }[]) {
  return [...words].sort((a, b) => {
    const baseA = a.palavra.split(/[^a-zA-ZÀ-ú0-9]/)[0];
    const baseB = b.palavra.split(/[^a-zA-ZÀ-ú0-9]/)[0];

    if (baseA !== baseB) return baseA.localeCompare(baseB);

    if (a.palavra === baseA) return -1;
    if (b.palavra === baseB) return 1;

    if (a.palavra.includes('&') && !b.palavra.includes('&')) return -1;
    if (!a.palavra.includes('&') && b.palavra.includes('&')) return 1;

    const indexA = a.palavra.indexOf('&');
    const indexB = b.palavra.indexOf('&');

    if (indexA !== -1 && indexB !== -1) {
      if (indexA !== indexB) return indexA - indexB; // menor índice vem primeiro
    }

    return a.palavra.localeCompare(b.palavra);
  });
}

  useEffect(() => {
    const sorted = sortWordsWithAndFirst(wordsJson);
    setSortedJson(sorted);
    const verbs = sorted
      .filter(item => item.categorias.includes('Verbos'))
      .map((item, index) => ({ id: index, name: item.palavra }));
    const groupedVerbs = groupVerbs(verbs);
    const sortedGroupedVerbs = sortGroupedVerbs(groupedVerbs);
    setVerbGroupsState(sortedGroupedVerbs);
  }, []);


  useEffect(() => {
    if (category === 'Verbos') {
      const verbs = sortedJson
        .filter(item => item.categorias.includes('Verbos'))
        .map((item, index) => ({ id: index, name: item.palavra }));
        setDicTest(verbs);
        setVerbGroupsState(groupVerbs(verbs));
    } else {
        const index = Number(category);
        const categoryName = CategoriesList[index].name;
        setDicTest(sortedJson
          .filter(item => item.categorias.includes(categoryName))
          .map((item, index) => {
            return {
              id: index,
              name: item.palavra
            };
        }));
    }
  }, [location.search]);

  const getResultsCount = () => {
    if (!searchText) return 0;

    switch (filter) {
      case 'alphabetical':
        return metadata.total;
      case 'recents':
        return recentTranslation.filter((item) =>
          item.toUpperCase().includes(searchText.toUpperCase())
        ).length;
      case 'categories':
        if (category) {
          if (CategoriesList[Number(category)].name === 'Verbos') {
            return filteredVerbList.length;
          }
          return filteredDicTest.length;
        }
        return CategoriesList.filter((item) =>
          item.name.toLowerCase().includes(searchText.toLowerCase())
        ).length;
      default:
        return 0;
    }
  };

  const resultsCount = getResultsCount();

  const getResultsLabel = () => {
    const count = resultsCount;
    if (count === 0) return '';

    let label = '';
    switch (filter) {
      case 'alphabetical':
      case 'recents':
        label = count === 1 ? 'sinal' : 'sinais';
        break;
      case 'categories':
        if (category) {
          label = count === 1 ? 'sinal' : 'sinais';
        } else {
          label = count === 1 ? 'categoria' : 'categorias';
        }
        break;
      default:
        label = count === 1 ? 'resultado' : 'resultados';
    }
    return `${count} ${label}`;
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode={'back'}>
      <IonContent ref={contentRef}>
        <div className="dictionary-container">
          <div className="sticky-container">
          <div className="dictionary-box">
            <IonSearchbar
              className="dictionary-textarea"
              placeholder={Strings.TEXT_PLACEHOLDER}
              onIonInput={e => setSearchText(e.detail.value!)}
              value={searchText}
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
            {(searchText && resultsCount > 0) && (
              <IonChip
                style={{ color: '#4b4b4b', background: '#FFFFFF'}}>
                {getResultsLabel()}
              </IonChip>
            )}
          </div>
          <div className="dictionary-words-container-divider" />
          {category && renderCategoryHeader(Number(category))}
          </div>

          <div className="dictionary-words-container">
            <IonList
            lines="none" className={`dictionary-words-list ${category ? 'has-category-header' : ''}`}>
              {regionalismWords.length > 0 && filter === 'alphabetical'
                ? regionalismWords.map((item) => renderOnRegionalism(item))
                : null}

              {filter === 'alphabetical'
                ? renderAllWords()
                : filter === 'recents'
                ? recentTranslation
                    .filter((item) => item.toUpperCase().includes(searchText.toUpperCase()))
                    .map((item, i, arr) => renderRecents(item, i === arr.length - 1))
                : category
                  ? renderCategoryWords(Number(category))
                  : CategoriesList.filter(item =>
                      item.name.toLowerCase().includes(searchText.toLowerCase())
                    ).map((item, index, arr) => {
                      const originalIndex = CategoriesList.findIndex(c => c.name === item.name);
                      return renderCategories(
                        { ...item, index: originalIndex },
                        index === arr.length - 1
                      );
                    })
              }

              {renderEmptyOrLoadingState()}

              {recentTranslation.length === 0 && filter === 'recents' ? (
                <div key="no-recent" className="dictionary-word-item">
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
            ref={infiniteScrollRef}
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
