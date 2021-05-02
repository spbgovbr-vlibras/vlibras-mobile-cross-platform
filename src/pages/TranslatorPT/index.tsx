import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import { OnBoarding } from 'components';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{Strings.TOOLBAR_TITLE}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <OnBoarding />
      </IonContent>
    </IonPage>
  );
}

export default TranslatorPT;
