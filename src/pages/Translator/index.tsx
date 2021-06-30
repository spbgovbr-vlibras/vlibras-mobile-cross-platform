import React from 'react';

import { IonText, IonButton, IonTextarea } from '@ionic/react';

import IconHandsTranslate from '../../assets/icons/IconHandsTranslate';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

function Translator() {
  return (
    <MenuLayout title={Strings.TRANSLATOR_TITLE}>
      <div className="translator-container">
        <div className="translator-box">
          <IonText class="translator-header">
            {Strings.TRANSLATOR_HEADER}
          </IonText>
          <div className="translator-input-box">
            <IonTextarea
              class="translator-textarea"
              placeholder={Strings.TRANSLATOR_PLACEHOLDER}
              autofocus
              rows={5}
              cols={5}
              wrap="soft"
              required
              onIonChange={e => e.detail.value!}
            />
          </div>
        </div>
        <div className="translator-item-button-save">
          <IonButton class="translator-button-save">
            <IconHandsTranslate color="white" />
            {Strings.TRANSLATOR_TEXT_BUTTON}
          </IonButton>
        </div>
      </div>
    </MenuLayout>
  );
}
export default Translator;
