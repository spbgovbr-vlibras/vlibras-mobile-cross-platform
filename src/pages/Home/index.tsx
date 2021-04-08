import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import { ExploreContainer } from 'components';

import { Strings } from './strings';
import './styles.css';

function Home() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{Strings.TOOLBAR_TITLE}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <ExploreContainer name={Strings.CONTENT_TITLE} />
      </IonContent>
    </IonPage>
  );
}

export default Home;
