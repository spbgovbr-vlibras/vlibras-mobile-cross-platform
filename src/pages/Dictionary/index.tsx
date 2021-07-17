import React, { useCallback, useDebugValue, useEffect, useState } from 'react';

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
import { debounce } from 'lodash';

import { MenuLayout } from 'layouts';
import api from 'services/api';

import { Strings } from './strings';

import './styles.css';

function Dictionary() {
  const renderWord = (item: string) => (
    <IonItem class="dictionary-word-item">
      <IonText class="dictionary-words-style">{item}</IonText>
    </IonItem>
  );

  const TIME_DEBOUNCE_MS = 0;
  const [dictionary, setDictionary] = useState<string[]>([]);
  const [words, setWords] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const onSearch = useCallback(value => {
    const input = words.filter(item => item.includes(value.toUpperCase()));
    setDictionary(input);
  }, []);

  const debouncedSearch = useCallback(debounce(onSearch, TIME_DEBOUNCE_MS), [
    onSearch,
  ]);

  const onInputChange = useCallback(
    evt => {
      setSearchText(evt.target.value);
      onSearch(evt.target.value);
    },
    [debouncedSearch],
  );

  useEffect(() => {
    api
      .get('/api/signs')
      .then(response => {
        setDictionary(response.data);
        setWords(response.data);
      })
      .catch(err => {
        console.error(`Segue o retorno:${err}`);
      });
  }, []);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="dictionary-container">
          <div className="dictionary-box">
            <IonSearchbar
              className="dictionary-textarea"
              placeholder={Strings.TEXT_PLACEHOLDER}
              value={searchText}
              onIonChange={onInputChange}
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
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
