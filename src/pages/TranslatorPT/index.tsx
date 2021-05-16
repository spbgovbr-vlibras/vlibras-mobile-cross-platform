import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';

import { OnBoarding } from 'components';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  return (
    <IonPage>
      <IonContent>
        <OnBoarding />
      </IonContent>
    </IonPage>
  );
}

export default TranslatorPT;
