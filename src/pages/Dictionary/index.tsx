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
import { restoreUnityTransplant } from 'utils/unityCanvasDock';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';

import {
  IconHandsTranslate,
  IconTodos,
  IconUndefined,
} from 'assets';
import { BottomTabBar } from 'components';
import LoadingSpinner from 'components/LoadingSpinner';
import {
  FIRST_PAGE_INDEX,
  MAX_PER_PAGE,
  PAGE_STEP_SIZE,
} from 'constants/pagination';
import paths from 'constants/paths';
import CategoriesList from 'data/Categories';
import wordsJson from 'data/classified_words_reduced.json';
import { useTranslation } from 'hooks/Translation';
import { MenuLayout } from 'layouts';
import { Words, Tag } from 'models/dictionary';
import { DictionaryData } from 'services/types';
import { getDictionaryData, sanitizeWikiText } from 'services/wiktionary';
import { RootState } from 'store';
import { Creators, ErrorDictionaryRequest } from 'store/ducks/dictionary';

import DictionaryMiniPlayer from './MiniPlayer';
import { Strings } from './strings';

import './styles.css';

export type DictionaryFilter = 'categories' | 'alphabetical' | 'recents';

/** Agrupamento de verbos (categoria Verbos e colapso no modo A–Z). */
export type VerbConjugationRow = {
  original: string;
  prefix: string;
  suffix: string;
  transformed: string;
};

export type VerbGroupBuckets = Record<
  string,
  { conjugation: VerbConjugationRow[]; desambiguation: Words[] }
>;

const TIME_DEBOUNCE_MS = 200;
const ALPHABET_LETTERS = ['#', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];
const TODOS_TAG_NAME = 'TODOS';
const HIDDEN_CATEGORY_TAGS = new Set(['TODOS', 'INDEFINIDO', 'INDEFINIDOS']);

/** Normaliza nomes da API e do CategoriesList para comparar (espaços, _, /). */
function normalizeCategoryKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_/\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type AzListItem = { name: string; type: 'word' | 'desambiguation'; data: Words | Words[] };

function resolveLetterFromParam(letterParam: string | null): string | null {
  if (!letterParam) return null;
  return letterParam === '0-9' ? '#' : letterParam.toUpperCase();
}

function letterToParam(letter: string): string {
  return letter === '#' ? '0-9' : letter;
}

function groupWordsForDisplay(words: Words[]): (Words | Words[])[] {
  const groups: (Words | Words[])[] = [];
  let i = 0;
  while (i < words.length) {
    const word = words[i];
    if (word.name.includes('&')) {
      const prefix = word.name.split('&', 1)[0];
      const group: Words[] = [];
      while (i < words.length && words[i].name.startsWith(prefix + '&')) {
        group.push(words[i]);
        i++;
      }
      i--;
      groups.push(group);
    } else if (i < words.length - 1 && words[i + 1].name.includes('&')) {
      const prefix = words[i + 1].name.split('&', 1)[0];
      if (prefix === word.name) {
        const group: Words[] = [];
        group.push(word);
        i++;
        while (i < words.length && words[i].name.startsWith(prefix + '&')) {
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

function resolveItemFirstLetter(rawName: string): string | null {
  let firstChar = rawName.trim().charAt(0).toUpperCase();

  if (/[0-9]/.test(firstChar)) {
    const isSingleDigit = /^[0-9]$/.test(rawName.trim());
    if (isSingleDigit) {
      return '#';
    }
    const withoutPersonPrefix = rawName.replace(/^(1S_|2S_|3S_|1P_|2P_|3P_)/, '');
    const alphaMatch = withoutPersonPrefix.match(/[A-ZÇÕÂÊÍÓÚ]/i);
    if (!alphaMatch) return null;
    firstChar = alphaMatch[0].toUpperCase();
  }

  return firstChar;
}

function getAvailableLetters(words: Words[]): string[] {
  const letters = new Set<string>();
  for (const word of words) {
    const letter = resolveItemFirstLetter(word.name);
    if (letter) letters.add(letter);
  }
  return ALPHABET_LETTERS.filter((l) => letters.has(l));
}

function buildAzGroupedData(
  words: Words[],
  groupVerbsFn: (words: Words[]) => VerbGroupBuckets,
  sortGroupedVerbsFn: (verbs: VerbGroupBuckets) => VerbGroupBuckets
): { itemsByLetter: Record<string, AzListItem[]>; azVerbBuckets: VerbGroupBuckets } {
  const groupedWords = groupWordsForDisplay(words);
  const plainSinglesForCollapse = groupedWords.filter((g): g is Words => !Array.isArray(g));
  const azVerbBuckets = sortGroupedVerbsFn(groupVerbsFn(plainSinglesForCollapse));
  const desambiguationSegments = groupedWords.filter((g): g is Words[] => Array.isArray(g));
  const collapsedLemmaWords: Words[] = Object.keys(azVerbBuckets)
    .sort((a, b) => a.localeCompare(b))
    .map((lemma, idx) => ({ id: -(idx + 1), name: lemma }));

  const allItems: AzListItem[] = [];
  collapsedLemmaWords.forEach((w) => {
    allItems.push({ name: w.name, type: 'word', data: w });
  });
  desambiguationSegments.forEach((group) => {
    allItems.push({
      name: group[0].name.split('&', 1)[0],
      type: 'desambiguation',
      data: group,
    });
  });

  const itemsByLetter: Record<string, AzListItem[]> = {};
  allItems.forEach((item) => {
    const letter = resolveItemFirstLetter(item.name);
    if (!letter) return;
    if (!itemsByLetter[letter]) {
      itemsByLetter[letter] = [];
    }
    itemsByLetter[letter].push(item);
  });

  Object.keys(itemsByLetter).forEach((letter) => {
    itemsByLetter[letter].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  });

  return { itemsByLetter, azVerbBuckets };
}

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
  // Both /dictionary (opened from drawer) and /dictionary-player (opened from
  // the home tab bar) should use the floating mini player to keep the user on
  // the dictionary while playing the sign.
  const isDictionaryPlayerRoute =
    location.pathname === paths.DICTIONARY_PLAYER ||
    location.pathname === paths.DICTIONARY;
  const queryParams = new URLSearchParams(location.search);
  const [searchText, setSearchText] = useState('');
  const initialFilter = (queryParams.get('filter') as DictionaryFilter) || 'categories';
  const [filter, setFilter] = useState<DictionaryFilter>(initialFilter);
  const [expandedVerb, setExpandedVerb] = useState<string | null>(null);
  const [expandedWord, setExpandedWord] = useState<string | null>(null);
  const [wordMeanings, setWordMeanings] = useState<Record<string, Partial<DictionaryData> | null>>({});
  const [loadingMeaning, setLoadingMeaning] = useState<string | null>(null);
  const [sortedJson, setSortedJson] = useState<{ palavra: string; categorias: string[] }[]>([]);
  const dispatch = useDispatch();

  const infiniteScrollRef = useRef<HTMLIonInfiniteScrollElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  /**
   * Wrapper externo da p\u00e1gina + barra fixa s\u00e3o medidos em runtime para que o
   * cabe\u00e7alho de cada letra fique gr\u00e1udado logo abaixo da searchbar/chips
   * (sem precisar chutar valores em CSS).
   */
  const dictionaryContainerRef = useRef<HTMLDivElement>(null);
  const stickyContainerRef = useRef<HTMLDivElement>(null);

  const {
    metadata,
    words: dictionary,
    tags,
    regionalismWords,
    loading,
    error,
    loadingTags,
    allCurrentWords,
    currentTag,
    allWordsCache,
  } = useSelector(({ dictionaryReducer }: RootState) => dictionaryReducer);

  const allWordsList: Words[] = React.useMemo(() =>
    allCurrentWords ? allCurrentWords.map((w, i) => ({id: i, name: w})) : []
  , [allCurrentWords]);
  const allWordsSet = React.useMemo(
    () => new Set(allWordsList.map((w) => w.name)),
    [allWordsList]
  );

  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );

  const history = useHistory();

  const { setTextGloss, setTextPtBr, recentTranslation, dictMiniPlayer, setDictMiniPlayer } = useTranslation();
  const isMiniPlayerActive = isDictionaryPlayerRoute && dictMiniPlayer.active;

  const [verbGroupsState, setVerbGroupsState] = useState<VerbGroupBuckets>({});

  const VERB_COUNT = 20;
  const [visibleVerbCount, setVisibleVerbCount] = useState(VERB_COUNT);
  const verbList = React.useMemo(() => Object.entries(verbGroupsState), [verbGroupsState]);
  const category = queryParams.get('category');
  const selectedLetter = resolveLetterFromParam(queryParams.get('letter'));
  /** Tag na URL pode vir como VERBOS (API) ou Verbos (rotas antigas / dados locais). */
  const isVerbCategory = (category ?? '').toUpperCase() === 'VERBOS';

  useIonViewDidEnter(() => {
    contentRef.current?.getScrollElement().then((el) => {
      const queryParams = new URLSearchParams(window.location.search);
      const scrollParam = queryParams.get('scroll');
      if (scrollParam) {
        el.scrollTop = toNumber(scrollParam);
      }
    });
  });

  useEffect(() => {
    if (!isDictionaryPlayerRoute && dictMiniPlayer.active) {
      restoreUnityTransplant();
      setDictMiniPlayer(false);
    }
  }, [isDictionaryPlayerRoute, dictMiniPlayer.active, setDictMiniPlayer]);

  /**
   * Atualiza a CSS var `--dict-sticky-offset` com a altura real da barra
   * fixa (searchbar + chips + divider + cabe\u00e7alho de categoria opcional).
   * Assim o cabe\u00e7alho de letra (sticky) gruda exatamente embaixo dela
   * mesmo se a barra mudar de altura (ex.: chip de regionalismo aparece).
   */
  useEffect(() => {
    const sticky = stickyContainerRef.current;
    const containerEl = dictionaryContainerRef.current;
    if (!sticky || !containerEl) return undefined;

    const updateOffset = () => {
      const h = Math.ceil(sticky.getBoundingClientRect().height);
      containerEl.style.setProperty('--dict-sticky-offset', `${h}px`);
    };

    updateOffset();

    const ResizeObserverCtor =
      typeof window !== 'undefined' && (window as any).ResizeObserver
        ? (window as any).ResizeObserver
        : null;
    if (!ResizeObserverCtor) {
      window.addEventListener('resize', updateOffset);
      return () => window.removeEventListener('resize', updateOffset);
    }
    const observer = new ResizeObserverCtor(updateOffset);
    observer.observe(sticky);
    return () => observer.disconnect();
  }, [filter, category, selectedLetter, currentRegionalism.abbreviation, searchText, regionalismWords.length]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilter = params.get('filter') as DictionaryFilter | null;
    if (urlFilter === 'alphabetical') {
      setFilter('alphabetical');
    } else if (params.get('category')) {
      setFilter('categories');
    }
  }, [location.search]);

  useEffect(() => {
    if (selectedLetter) {
      contentRef.current?.scrollToTop(0);
    }
  }, [selectedLetter]);

  useIonViewWillEnter(() => {
    dispatch(Creators.fetchTags.request());
    dispatch(
      currentRegionalism.abbreviation !== 'BR'
        ? Creators.fetchRegionalismWords.request({
            abbrreviation: currentRegionalism.abbreviation,
          })
        : Creators.clearRegionalismWords()
    );
    // Pré-carrega o índice A–Z em background para "Todos" abrir na hora.
    if (allWordsCache.length === 0) {
      dispatch(
        Creators.fetchWords.request({
          page: FIRST_PAGE_INDEX,
          limit: MAX_PER_PAGE,
          cacheOnly: true,
        })
      );
    }
  }, [dispatch, currentRegionalism.abbreviation, allWordsCache.length]);

  /** Lista local embutida no app — disponível offline enquanto a API não responde. */
  useEffect(() => {
    if (allWordsCache.length === 0 && wordsJson.length > 0) {
      dispatch(Creators.setAllWordsCache(wordsJson.map((w) => w.palavra)));
    }
  }, [dispatch, allWordsCache.length]);

  function translate(text: string) {
    if (text === '%') text = '%25';
    setTextGloss(text, true);
    saveDictionaryState();
    if (isDictionaryPlayerRoute) {
      setDictMiniPlayer(true, text);
      return;
    }
    history.push(paths.HOME, { playGloss: text });
  }

  async function translatePtBr(text: string) {
    const cleanText = sanitizeWikiText(text);
    saveDictionaryState();
    if (isDictionaryPlayerRoute) {
      // Abre o mini player na hora com indicador de "traduzindo".
      // O gloss real chega depois e dispara a reprodução automaticamente.
      setDictMiniPlayer(true, '', { loading: true });
      try {
        const gloss = await setTextPtBr(cleanText, false, false);
        setDictMiniPlayer(true, gloss);
      } catch {
        setDictMiniPlayer(false);
      }
      return;
    }
    const gloss = await setTextPtBr(cleanText, false, false);
    history.push(paths.HOME, { playGloss: gloss });
  }

  function saveDictionaryState() {
    const dictionaryState = {
      filter,
      searchText,
      expandedWord,
      expandedVerb,
      visibleVerbCount,
      category,
    };
    sessionStorage.setItem('dictionaryState', JSON.stringify(dictionaryState));
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
    // O sinal vem da API com `_` separando palavras compostas
    // (ex.: CACHORRO_QUENTE) e com `&` para desambiguação
    // (ex.: MACACO&MICO_LEÃO_DOURADO). No display queremos espaços
    // e parênteses, mantendo o gloss original para enviar ao avatar.
    const withParens = gloss.indexOf('&') > -1
      ? gloss.replace('&', '(') + ')'
      : gloss;
    return withParens.replace(/_/g, ' ');
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
    params.delete('letter');
    history.replace({ search: params.toString() });
    setVisibleVerbCount(VERB_COUNT);
    // Reset scroll when clearing params (going back to main list)
    contentRef.current?.scrollToTop(0);
  }

  function handleBackFromLetter() {
    const params = new URLSearchParams(location.search);
    params.delete('letter');
    history.replace({ search: params.toString() });
    contentRef.current?.scrollToTop(0);
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
                  <button className='translate-def-button' onClick={(e) => { e.stopPropagation(); translatePtBr(definitionText); }}>
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

  function renderContext(item: Words[]) {
    return (
      <IonList lines="none" className="dictionary-words-list conjugation-list">
      <div className="verb-section-header">CONTEXTO</div>
      {item.map((word, index) => {
        const [mainWord, suffix] = word.name.split('&', 2);
        const prettyMain = (mainWord || '').replace(/_/g, ' ');
        const prettySuffix = (suffix || '').replace(/_/g, ' ');
        return (
          <div key={`teste-${index}`} className="desambiguation-section-header">
            <IonItem key={`${suffix}-form-${index}`}
                    className="dictionary-word-item desambiguation-text"
                    onClick={(e) => { e.stopPropagation(); translate(word.name); }}>
              <div className="desambiguation-text">
                <IonText className="dictionary-words-style">{prettyMain} ({prettySuffix})</IonText>
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
    // Quando não existe gloss-base isolado (ex.: só existe "AÇAÍ&FRUTA"),
    // tocar apenas o prefixo ("AÇAÍ") cai em datilologia. Nesses casos,
    // usamos o primeiro gloss desambiguado da lista para tocar o sinal correto.
    const primaryGloss = allWordsSet.has(name) ? name : item[0].name;
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
          <IonText className="dictionary-words-style" onClick={(e) => { e.stopPropagation(); translate(primaryGloss); }}>
            {formattedGloss(name)}
          </IonText>
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

  const renderWord = (item: Words, isLast: boolean, azBuckets?: VerbGroupBuckets) => {
    const isExpanded = expandedWord === item.name;
    const vbGroup = azBuckets?.[item.name];
    const slicedConcord =
      vbGroup?.conjugation.filter(
        (w) => !(w.original === item.name && !w.prefix && !w.suffix)
      ) ?? [];

    return (
      <div key={item.id}>
        <IonItem
          className={`dictionary-word-item ${isExpanded ? 'word-expanded-header' : ''}`}
          button
          detail={false}
          lines={'none'}
          onClick={() => toggleWordMeaning(item)}
        >
          <IonText className="dictionary-words-style" onClick={(e) => { e.stopPropagation(); translate(item.name); }}>
            {formattedGloss(item.name)}
          </IonText>
          <IonIcon
            icon={isExpanded ? chevronUp : chevronDown}
            slot="end"
            className="verb-dropdown-icon"
          />
        </IonItem>
        {isExpanded && (
          <div className="word-meaning-container">
            {renderMeaningContent(item)}
            {slicedConcord.length > 0 && (
              <>
                <div className="verb-section-header">CONCORDÂNCIA VERBAL</div>
                <IonList lines="none" className="dictionary-words-list conjugation-list">
                  {slicedConcord.map((w, i) => (
                    <IonItem
                      key={`${item.name}-az-concord-${i}`}
                      className="dictionary-word-item conjugation-item"
                      onClick={(e) => { e.stopPropagation(); translate(w.original); }}
                    >
                      <div className="conjugation-item-inner">
                        <div className="conjugation-text-wrapper">
                          <IonText className="dictionary-words-style conjugation-part">
                            {formattedGloss(w.prefix)}
                          </IonText>
                          <IonIcon icon={arrowForward} className="conjugation-arrow" />
                          <IonText className="dictionary-words-style conjugation-part">
                            {formattedGloss(w.suffix)}
                          </IonText>
                        </div>
                        <IonText className="conjugation-gloss-tech">
                          {formattedGloss(w.original)}
                        </IonText>
                      </div>
                    </IonItem>
                  ))}
                </IonList>
              </>
            )}
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

  // Helper to map API tag name to icon
  const getCategoryIcon = (tagName: string) => {
    const key = normalizeCategoryKey(tagName);
    const match = CategoriesList.find(
      (c) => normalizeCategoryKey(c.name) === key
    );
    return match ? match.logoUrl : IconUndefined;
  };

  // Helper to format category name for display (Title Case, remove underscores)
  const formatCategoryName = (tagName: string) => {
    const key = normalizeCategoryKey(tagName);
    const match = CategoriesList.find(
      (c) => normalizeCategoryKey(c.name) === key
    );
    if (match) {
      return match.name;
    }

    // Fallback formatting
    let formatted = tagName.replace(/_/g, ' ');
    formatted = formatted.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    return formatted;
  };

  const renderCategoryHeader = (categoryName: string) => (
    <>
      <div className='category-header'>
        <IonItem lines="none" className="dictionary-word-item" onClick={handleFilterCategories}>
          <IonButton fill="clear" slot="start" onClick={handleFilterCategories}>
          <IonIcon icon={chevronBack} />
        </IonButton>
            <IonImg
              src={getCategoryIcon(categoryName)}
              style={{ width: '30px', height: '30px', marginRight: '12px' }}
            />
          <IonText className="dictionary-words-style" style={{ fontWeight: 'bold' }}>
            {formatCategoryName(categoryName)}
          </IonText>
        </IonItem>
      </div>
    </>
  );

  const renderLetterHeader = (letter: string) => (
    <div className="category-header">
      <IonItem lines="none" className="dictionary-word-item" onClick={handleBackFromLetter}>
        <IonButton fill="clear" slot="start" onClick={handleBackFromLetter}>
          <IonIcon icon={chevronBack} />
        </IonButton>
        <IonText className="dictionary-words-style" style={{ fontWeight: 'bold' }}>
          {letter === '#' ? '0..9' : letter}
        </IonText>
      </IonItem>
    </div>
  );

  const renderLetterCategory = (letter: string, isLast: boolean) => (
    <>
      <IonItem
        className="dictionary-word-item category-item"
        button
        lines="none"
        onClick={() => {
          const params = new URLSearchParams();
          params.set('filter', 'alphabetical');
          params.set('letter', letterToParam(letter));
          history.push({ search: params.toString() });
          setFilter('alphabetical');
        }}
      >
        <IonText className="dictionary-words-style">
          {letter === '#' ? '0..9' : letter}
        </IonText>
      </IonItem>
      {!isLast && <div className="words-list-popover-content-divider" />}
    </>
  );

  const renderTodosCategory = (isLast: boolean) => (
    <>
      <IonItem
        className="dictionary-word-item category-item"
        button
        lines="none"
        onClick={handleFilterAlpha}
      >
        <IonImg
          src={IconTodos}
          style={{ width: '25px', height: '25px', marginRight: '20px' }}
        />
        <IonText className="dictionary-words-style">Todos</IonText>
      </IonItem>
      {!isLast && <div className="words-list-popover-content-divider" />}
    </>
  );

  const renderCategories = (item: Tag, isLast: boolean) => (
    <>
      <IonItem
        className="dictionary-word-item category-item"
        button
        lines={'none'}
        onClick={() => {
          setFilter('categories');
          history.push(`?category=${item.name}`);
        }}
      >
        <IonImg
          src={getCategoryIcon(item.name)}
          style={{ width: '25px', height: '25px', marginRight: '20px' }}
        />
        <IonText className="dictionary-words-style">{formatCategoryName(item.name)}</IonText>
      </IonItem>
      {!isLast && <div key={`divider-category-${item.id}`} className="words-list-popover-content-divider" />}
    </>
  );

  /** Só exibe palavras quando o cache Redux corresponde à categoria da URL. */
  const isCategoryDataReady =
    !!category && currentTag === category && allWordsList.length > 0;

  const renderCategoryWords = () => {
    if (!isCategoryDataReady) {
      return null;
    }
    return (
      <>
        {isVerbCategory ?
          renderVerbs() : renderNoVerbsWords(allWordsList)}
      </>
    );
  };

  const renderAllWords = () => {
    const isSearching = searchText.trim().length > 0;

    // Índice de letras: só calcula quais letras existem (rápido, sem agrupar verbos).
    if (!isSearching && !selectedLetter) {
      const availableLetters = getAvailableLetters(allWordsList);
      return availableLetters.map((letter, index) =>
        renderLetterCategory(letter, index === availableLetters.length - 1)
      );
    }

    const wordsSource = isSearching ? dictionary : allWordsList;
    const { itemsByLetter, azVerbBuckets } = buildAzGroupedData(
      wordsSource,
      groupVerbs,
      sortGroupedVerbs
    );

    if (isSearching) {
      const flatSorted = Object.values(itemsByLetter)
        .flat()
        .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
      return (
        <div className="dictionary-flat-results">
          {flatSorted.map((item, index) => {
            const isLast = index === flatSorted.length - 1;
            if (item.type === 'word') {
              return renderWord(item.data as Words, isLast, azVerbBuckets);
            }
            return renderDesambiguateWord(item.data as Words[], isLast);
          })}
        </div>
      );
    }

    const itemsForLetter = itemsByLetter[selectedLetter!] ?? [];
    return (
      <div className="dictionary-letter-body">
        {itemsForLetter.map((item, index) => {
          const isLast = index === itemsForLetter.length - 1;
          if (item.type === 'word') {
            return renderWord(item.data as Words, isLast, azVerbBuckets);
          }
          return renderDesambiguateWord(item.data as Words[], isLast);
        })}
      </div>
    );
  };

  function handleVerbClick(verb: string) {
    if (expandedVerb === verb) {
      setExpandedVerb(null);
    } else {
      setExpandedVerb(verb);
    }
  }

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
  /**
   * Faz parsing tolerante do gloss para suportar formas direcionais
   * malformadas vindas da API (ex.: "1S_FARTAR1S" sem `_` antes do sufixo,
   * "2S_ESCOLHER__1S" com `__` duplicado). Retorna prefix/base/suffix
   * normalizados (ex.: "1S_", "FARTAR", "_1S"). Quando não há sufixo, base
   * pode terminar com `_` extra que limpamos. Sem isso, glosses fora do
   * padrão viram "verbos" próprios e a CONCORDÂNCIA VERBAL some.
   */
  function parseVerbGloss(name: string): { prefix: string; base: string; suffix: string } | null {
    if (!name || name.includes('&')) return null;
    let body = name;
    let prefix = '';
    const prefixMatch = body.match(/^(1S|2S|3S|1P|2P|3P)_(.+)$/);
    if (prefixMatch) {
      prefix = `${prefixMatch[1]}_`;
      body = prefixMatch[2];
    }
    let suffix = '';
    const suffixMatch = body.match(/^(.+?)_*(1S|2S|3S|1P|2P|3P)$/);
    if (suffixMatch) {
      body = suffixMatch[1].replace(/_+$/, '');
      suffix = `_${suffixMatch[2]}`;
    }
    body = body.replace(/^_+|_+$/g, '');
    if (!body) return null;
    return { prefix, base: body, suffix };
  }


  function groupVerbs(words: Words[]): VerbGroupBuckets {
    const acc: VerbGroupBuckets = {};

    for (const word of words) {
      if (word.name.includes('&')) {
        const baseVerb = word.name.split('&', 1)[0];
        if(!acc[baseVerb]) acc[baseVerb] = {conjugation: [], desambiguation: []};
        acc[baseVerb].desambiguation.push(word);
        continue;
      }

      const parsed = parseVerbGloss(word.name);
      const baseVerb = parsed?.base || word.name;
      if(!acc[baseVerb]) acc[baseVerb] = {conjugation: [], desambiguation: []};

      if (!parsed) continue;
      const { prefix, suffix } = parsed;

      const prefixText = prefixMap[prefix] || '';
      const suffixText = suffixMap[suffix] || '';

      if (prefixText && suffixText) {
        const transformed = `${prefixText} PARA ${suffixText}`;
        acc[baseVerb].conjugation.push({ original: word.name,
                                     transformed,
                                     prefix: prefixText,
                                     suffix: suffixText });
      } else {
        acc[baseVerb].conjugation.unshift({ original: word.name,
                                        transformed: word.name,
                                        prefix: prefixText,
                                        suffix: suffixText });
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

    const bareBaseRank = (verbKey: string, w: VerbConjugationRow) =>
      w.original === verbKey && !w.prefix && !w.suffix ? -1 : 0;

    for (const verbKey in verbGroups) {
      verbGroups[verbKey].conjugation.sort((a, b) => {
        const diffBare =
          bareBaseRank(verbKey, a) - bareBaseRank(verbKey, b);
        if (diffBare !== 0) return diffBare;
        const ia = conjugationOrder.indexOf(a.transformed);
        const ib = conjugationOrder.indexOf(b.transformed);
        const ra = ia === -1 ? 999 : ia;
        const rb = ib === -1 ? 999 : ib;
        if (ra !== rb) return ra - rb;
        return a.original.localeCompare(b.original);
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
        elements.push(renderDesambiguateWord(group, i === dictionary.length-1));

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
          elements.push(renderDesambiguateWord(group, i === dictionary.length-1));
        } else {
          elements.push(renderWord(word, i === dictionary.length-1));
        }

      } else {
        elements.push(renderWord(word, i === dictionary.length-1));
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
      /** Oculta só a linha duplicada da forma base (mesmo gloss do cabeçalho). */
      const slicedWords = conjugationWords.filter(
        (w) => !(w.original === verb && !w.prefix && !w.suffix)
      );
      const bareBaseRow = conjugationWords.find(
        (w) => w.original === verb && !w.prefix && !w.suffix
      );
      const headerGloss = bareBaseRow?.original
        ?? conjugationWords[0]?.original
        ?? desambiguationWords[0]?.name
        ?? verb;
      return (
        <div key={verb} className="verb-group">
          <IonItem
            lines={'none'}
            className={`dictionary-word-item ${isExpanded ? 'word-expanded-header' : ''}`}
            button
            detail={false}
            onClick={() => toggleVerbMeaning(verb)}
          >
            <IonText className="dictionary-words-style" onClick={(e) => { e.stopPropagation(); translate(headerGloss); }}>{formattedGloss(verb)}</IonText>
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
                          <button className='translate-def-button' onClick={(e) => { e.stopPropagation(); translatePtBr(definitionText); }}>
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
                              onClick={(e) => { e.stopPropagation(); translate(w.original); }}>
                        <div className="conjugation-item-inner">
                          <div className="conjugation-text-wrapper">
                            <IonText className="dictionary-words-style conjugation-part">{formattedGloss(w.prefix)}</IonText>
                            <IonIcon icon={arrowForward} className="conjugation-arrow" />
                            <IonText className="dictionary-words-style conjugation-part">{formattedGloss(w.suffix)}</IonText>
                          </div>
                          <IonText className="conjugation-gloss-tech">{formattedGloss(w.original)}</IonText>
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
    const categoryLoading =
      filter === 'categories' &&
      !!category &&
      (!isCategoryDataReady || loading);

    const listIsEmpty =
      (filter === 'alphabetical' && allWordsList.length === 0) ||
      (filter === 'categories' && !category && tags.length === 0) ||
      categoryLoading;

    if (listIsEmpty) {
      if (error) {
        return (
          <div className="dictionary-word-item centered">
            {error === ErrorDictionaryRequest.INTERNET_CONNECTION
              ? Strings.DICTIONARY_INTERNET_CONNECTION_ERROR
              : Strings.DICTIONARY_REQUEST_ERROR}
          </div>
        );
      } else if (loading || loadingTags) {
        return <LoadingSpinner loadingDescription="Carregando..." />;
      } else if (searchText) {
        return (
          <div className="dictionary-word-item centered">
            {Strings.DICTIONARY_WORD_NOT_FOUND}
          </div>
        );
      } else {
        // Initial load or just empty list
        return null;
      }
    }
    return null;
  };

  useEffect(() => {
    const debouncedSearch = debounce(() => {
      if (filter === 'alphabetical' || (filter === 'categories' && category)) {
        if (filter === 'categories' && category && category === currentTag && allWordsList.length > 0) {
          return;
        }
        if (filter === 'alphabetical' && !category) {
          if (allWordsList.length > 0 && currentTag === null) {
            return;
          }
          if (allWordsList.length === 0 && allWordsCache.length > 0) {
            dispatch(Creators.setAllWords(allWordsCache));
            return;
          }
        }
        dispatch(
          Creators.fetchWords.request({
            page: FIRST_PAGE_INDEX,
            limit: MAX_PER_PAGE,
            tag: category || undefined,
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
  }, [searchText, filter, category, dispatch, currentTag, allWordsList.length, allWordsCache]);

  useEffect(() => {
    if (!loading) {
      infiniteScrollRef.current?.complete();
    }
  }, [infiniteScrollRef, loading]);

  // This effect handles initial load when category changes via URL
  useEffect(() => {
    setVerbGroupsState({});
    setVisibleVerbCount(VERB_COUNT);
    setExpandedVerb(null);

    if (category) {
      if (category === currentTag && allWordsList.length > 0) {
        return;
      }
      dispatch(Creators.clearWords());
      contentRef.current?.scrollToTop(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, dispatch]);

  // Update verbGroupsState when dictionary changes and category is verbs
  useEffect(() => {
    if (!isVerbCategory) {
      setVerbGroupsState({});
      return;
    }
    const groupedVerbs = groupVerbs(allWordsList);
    const sortedGroupedVerbs = sortGroupedVerbs(groupedVerbs);
    setVerbGroupsState(sortedGroupedVerbs);
  }, [allWordsList, isVerbCategory]);


  const fetchWords = useCallback(() => {
    dispatch(
      Creators.fetchWords.request({
        page: metadata.current_page + PAGE_STEP_SIZE,
        limit: MAX_PER_PAGE,
        tag: category || undefined,
        ...(searchText.length > 0 && {
          name: `${searchText}%`,
        }),
      })
    );
  }, [dispatch, infiniteScrollRef, metadata, searchText, category]);

  function handleFilterAlpha() {
    const params = new URLSearchParams();
    params.set('filter', 'alphabetical');
    history.replace({ search: params.toString() });
    setFilter('alphabetical');
    contentRef.current?.scrollToTop(0);

    if (allWordsList.length > 0 && currentTag === null) {
      return;
    }

    const wordsToShow =
      allWordsCache.length > 0
        ? allWordsCache
        : wordsJson.map((w) => w.palavra);

    if (wordsToShow.length > 0) {
      dispatch(Creators.clearWords());
      dispatch(Creators.setAllWords(wordsToShow));
      return;
    }

    dispatch(
      Creators.fetchWords.request({
        page: FIRST_PAGE_INDEX,
        limit: MAX_PER_PAGE,
      })
    );
  }

  function handleFilterRecents() {
    clearUrlParams();
    setFilter('recents');
  }

  function handleFilterCategories() {
    clearUrlParams();
    setFilter('categories');
  }

  function sortGroupedVerbs(verbs: VerbGroupBuckets): VerbGroupBuckets {
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

  // Remove the local JSON effect
  useEffect(() => {
    const sorted = sortWordsWithAndFirst(wordsJson);
    setSortedJson(sorted);
    // No longer setting local verb state on mount
  }, []);


  // Remove the local filteredDicTest effect
  /*
  useEffect(() => {
    if (category === 'Verbos') {
      ...
  }, [location.search]);
  */

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
          if (isVerbCategory) {
            return filteredVerbList.length;
          }
          return allWordsList.length; // Use allWordsList.length instead of dictionary.length
        }
        return tags.filter((item) =>
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
        <div className="dictionary-container" ref={dictionaryContainerRef}>
          <div className="sticky-container" ref={stickyContainerRef}>
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
          {category && renderCategoryHeader(category)}
          {filter === 'alphabetical' && selectedLetter && renderLetterHeader(selectedLetter)}
          </div>

          <div className="dictionary-words-container">
            <IonList
            lines="none" className={`dictionary-words-list ${category || selectedLetter ? 'has-category-header' : ''}`}>
              {regionalismWords.length > 0 && filter === 'alphabetical' && !selectedLetter
                ? regionalismWords.map((item) => renderOnRegionalism(item))
                : null}

              {regionalismWords.length > 0 && filter === 'alphabetical' && !selectedLetter ? (
                <hr
                  className="dictionary-regionalism-general-divider"
                  aria-hidden="true"
                />
              ) : null}

              {filter === 'alphabetical'
                ? renderAllWords()
                : filter === 'recents'
                ? recentTranslation
                    .filter((item) => item.toUpperCase().includes(searchText.toUpperCase()))
                    .map((item, i, arr) => renderRecents(item, i === arr.length - 1))
                : category
                  ? renderCategoryWords()
                  : (() => {
                      const filteredTags = tags.filter(
                        (item) =>
                          !HIDDEN_CATEGORY_TAGS.has(item.name.toUpperCase()) &&
                          item.name.toLowerCase().includes(searchText.toLowerCase())
                      );
                      const showTodos =
                        !searchText ||
                        'todos'.includes(searchText.toLowerCase());
                      return (
                        <>
                          {filteredTags.map((item) => renderCategories(item, false))}
                          {showTodos && renderTodosCategory(true)}
                        </>
                      );
                    })()
              }

              {renderEmptyOrLoadingState()}

              {recentTranslation.length === 0 && filter === 'recents' ? (
                <IonItem key="no-recent" lines="none" className="dictionary-word-item">
                  <IonText className="dictionary-words-style">
                    Nenhuma pesquisa recente
                  </IonText>
                </IonItem>
              ) : null}
            </IonList>
          </div>
        </div>
        {metadata.hasNextPage && filter === 'alphabetical' && searchText.trim().length > 0 && (
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
        {(filter === 'categories') && isVerbCategory && (
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
        {/* Removed Infinite Scroll for regular categories because we are showing all words from cache now */}
        </IonContent>
      <BottomTabBar active="dictionary" />
      {isMiniPlayerActive && (
        <DictionaryMiniPlayer
          gloss={dictMiniPlayer.gloss}
          loading={dictMiniPlayer.loading}
          playRequestId={dictMiniPlayer.requestId}
          onClose={() => setDictMiniPlayer(false)}
        />
      )}
    </MenuLayout>
  );
}

export default Dictionary;
