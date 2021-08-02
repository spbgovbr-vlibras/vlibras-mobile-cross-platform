import React, { useCallback, useEffect, useState } from 'react';

import {
  IonChip,
  IonContent,
  IonItem,
  IonList,
  IonSearchbar,
  IonText,
} from '@ionic/react';
import { debounce } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';

import { MenuLayout } from 'layouts';
import { Words } from 'models/dictionary';
import { RootState } from 'store';
import { Creators } from 'store/ducks/dictionary';

import { Strings } from './strings';

import './styles.css';

function Dictionary() {
  const dispatch = useDispatch();
  const dictionary = useSelector(
    ({ dictionaryReducer }: RootState) => dictionaryReducer.words,
  );
  const renderWord = (item: Words) => (
    <IonItem class="dictionary-word-item">
      <IonText class="dictionary-words-style">{item.name}</IonText>
    </IonItem>
  );

  const TIME_DEBOUNCE_MS = 0;
  const [searchText, setSearchText] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const onSearch = useCallback(value => {}, []);

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
    dispatch(Creators.fetchWords.request({ page: 1, limit: 10 }));
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
