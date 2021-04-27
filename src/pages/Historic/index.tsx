import React from 'react';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { shareSocial, menu } from 'ionicons/icons';

import { Strings } from './strings';
import './styles.css';

function Historic() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar class="about-toolbar">
          <IonTitle class="about-toolbar-title">
            {Strings.TOOLBAR_TITLE}
          </IonTitle>

          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={menu} />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={shareSocial} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
    </IonPage>
  );
}

export default Historic;
