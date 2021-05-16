import React from 'react';

import {
  IonButton,
  IonChip,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonList,
  IonListHeader,
  IonText,
  IonTextarea,
} from '@ionic/react';

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

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="dictionary-container">
          <div className="dictionary-box">
            <div className="dictionary-input-box">
              <IonTextarea
                className="dictionary-textarea"
                placeholder={Strings.TEXT_PLACEHOLDER}
                autofocus
                rows={1}
                wrap="soft"
                required
                onIonChange={e => e.detail.value!}
              />
              <button type="button" className="dictionary-mic-button ">
                <MicIcon color="#B9B9B9" />
              </button>
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
              {words.map(item => renderWord(item))}
            </IonList>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
