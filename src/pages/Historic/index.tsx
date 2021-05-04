import React from 'react';

import {
  IonButton,
  IonButtons,
  IonChip,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonImg,
  IonItem,
  IonPage,
  IonText,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { menu, closeCircleOutline } from 'ionicons/icons';

import { logoTranslator1, logoTranslator2 } from '../../assets';
import { Strings } from './strings';
import './styles.css';

function Historic() {
  return (
    <IonPage>
      <IonHeader class="ion-no-border">
        <IonToolbar class="historic-toolbar">
          <IonTitle class="historic-toolbar-title">
            {Strings.TOOLBAR_TITLE}
          </IonTitle>

          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={menu} class="historic-toolbar-icon" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon
                icon={closeCircleOutline}
                class="historic-toolbar-icon-circleOutline"
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <div className="historic-container">
        <div className="historic-container-ion-chips">
          <IonChip
            class="historic-container-ion-chips-1"
            onClick={() => console.log('Geral')}
          >
            {Strings.CHIP_TEXT_1}
          </IonChip>
          <IonChip
            class="historic-container-ion-chips-2"
            onClick={() => console.log('PT-BR')}
          >
            {Strings.CHIP_TEXT_2}
          </IonChip>
          <IonChip
            class="historic-container-ion-chips-3"
            onClick={() => console.log('Libras')}
          >
            {Strings.CHIP_TEXT_3}
          </IonChip>
        </div>
        <div className="historic-container-ion-img-1">
          <IonImg
            src={logoTranslator1}
            class="historic-container-ion-img-translator-1"
          />
          <IonText>{Strings.TRANSLATOR_TEXT_1}</IonText>
        </div>
        <div className="historic-container-box-ion-text">
          <IonItem class="historic-container-box-ion-item">
            <IonTextarea
              placeholder={Strings.TEXT_AREA}
              rows={10}
              class="historic-container-box-ion-text-area"
            />
          </IonItem>
        </div>
        <div className="historic-container-ion-img-2">
          <IonImg
            src={logoTranslator2}
            class="historic-container-ion-img-translator-2"
          />
          <IonText>{Strings.TRANSLATOR_TEXT_2}</IonText>
        </div>
        <div className="historic-container-ion-chips-box">
          <IonChip class="historic-container-ion-chips-box-text-1">
            {Strings.CHIP_TEXT__LIBRAS_1}
          </IonChip>
          <IonChip class="historic-container-ion-chips-box-text-2">
            {Strings.CHIP_TEXT__LIBRAS_2}
          </IonChip>
          <IonChip class="historic-container-ion-chips-box-text-3">
            {Strings.CHIP_TEXT__LIBRAS_3}
          </IonChip>
        </div>
      </div>
    </IonPage>
  );
}

export default Historic;
