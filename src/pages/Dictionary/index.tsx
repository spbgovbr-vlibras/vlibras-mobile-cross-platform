import React from 'react';

import {
  IonChip,
  IonContent,
  IonIcon,
  IonImg,
  IonItem,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { closeCircleOutline, mic } from 'ionicons/icons';

import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

function Dictionary() {
  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="dictionary-container">
          <div>
            <IonItem className="dictionary-container-box-ion-text">
              <IonTextarea
                placeholder={Strings.TEXT_PLACEHOLDER}
                rows={2}
                className="dictionary-container-box-ion-text-area"
              />
              <IonIcon
                icon={mic}
                class="dictionary-container-box-ion-mic-icon"
              />
            </IonItem>
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
          <div className="dictionary-container-ion-text-suggestions">
            <IonText>{Strings.DICTIONARY_TEXT_1}</IonText>
            <IonText>{Strings.DICTIONARY_TEXT_2}</IonText>
            <IonText>{Strings.DICTIONARY_TEXT_3}</IonText>
            <IonText>{Strings.DICTIONARY_TEXT_4}</IonText>
            <IonText>{Strings.DICTIONARY_TEXT_5}</IonText>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Dictionary;
