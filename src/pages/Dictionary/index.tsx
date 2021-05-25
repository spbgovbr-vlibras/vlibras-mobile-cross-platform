import React, { useCallback, useDebugValue, useState } from 'react';

import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonListHeader,
  IonSearchbar,
  IonText,
  IonTextarea,
} from '@ionic/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { debounce, DictionaryIteratee } from 'lodash';

import MicIcon from '../../assets/icons/MicIcon';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

interface DictionaryWord {
  word: string;
  /* Category: STRING */
}

const words: Array<DictionaryWord> = [
  { word: 'ACONSELHAR' },
  { word: 'ACAUTELAR' },
  { word: 'AFILIAR' },
];

function Dictionary() {
  const renderWord = (item: DictionaryWord) => (
    <IonItem class="dictionary-word-item">
      <IonText class="dictionary-words-style">{item.word}</IonText>
    </IonItem>
  );

  const TIME_DEBOUNCE_MS = 0;
  const [dictionary, setDictionary] = useState(words);
  const [isMicVisible, setIsMicVisible] = useState(true);
  const [searchText, setSearchText] = useState('');
  const hideMic = document.getElementsByClassName(
    'dictionary-mic-button',
  ) as HTMLCollectionOf<HTMLElement>;

  const onSearch = useCallback(value => {
    const input = words.filter(item => item.word.includes(value.toUpperCase()));
    setDictionary(input);
  }, []);

  const debouncedSearch = useCallback(debounce(onSearch, TIME_DEBOUNCE_MS), [
    onSearch,
  ]);

  const onInputChange = useCallback(
    evt => {
      setSearchText(evt.target.value);
      if (!evt.target.value) {
        setIsMicVisible(true);
      } else {
        setIsMicVisible(false);
        onSearch(evt.target.value);
      }
    },
    [debouncedSearch],
  );

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="dictionary-container">
          <div className="dictionary-box">
            <div className="dictionary-searchbar">
              <IonSearchbar
                className="dictionary-textarea"
                placeholder={Strings.TEXT_PLACEHOLDER}
                value={searchText}
                onIonChange={onInputChange}
                inputmode="text"
                searchIcon="none"
              />
              {isMicVisible && (
                <button type="button" className="dictionary-mic-button ">
                  <MicIcon color="#B9B9B9" />
                </button>
              )}
            </div>
          </div>
          <div className="dictionary-container-ion-chips">
            <IonChip class="dictionary-container-ion-chips-suggestions-1">
              {Strings.CHIP_TEXT_SUGGESTIONS_1}
            </IonChip>
            <IonChip class="dictionary-container-ion-chips-suggestions-2">
              {Strings.CHIP_TEXT_SUGGESTIONS_2}
            </IonChip>
            <IonChip class="dictionary-container-ion-chips-suggestions-3">
              {Strings.CHIP_TEXT_SUGGESTIONS_3}
            </IonChip>
            <IonChip class="dictionary-container-ion-chips-suggestions-4">
              {Strings.CHIP_TEXT_SUGGESTIONS_4}
            </IonChip>
            <IonChip class="dictionary-container-ion-chips-suggestions-5">
              {Strings.CHIP_TEXT_SUGGESTIONS_5}
            </IonChip>
          </div>
          <div className="dictionary-words-container">
            <IonList lines="none" class="dictionary-words-list">
              {dictionary.map(item => renderWord(item))}
            </IonList>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
