import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';

import { RNCamera, FaceDetector } from 'react-native-camera';

import { OnBoarding } from 'components';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  return (
    <IonPage>
      <IonContent>
        {/* <OnBoarding /> */}

        <div className="container">
          <div className="video-recording"></div>
          <div className="area-recording"></div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default TranslatorPT;
