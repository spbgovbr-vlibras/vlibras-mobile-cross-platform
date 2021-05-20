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

import { OnBoarding, VideoOutputModal } from 'components';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  return (
    <IonPage>
      <IonContent>
        {/* <OnBoarding /> */}
        <VideoOutputModal
          outputs={[
            'febre',
            'hospital',
            'leptospirose',
            'paralelepípedo',
            'remédio',
            'teste',
            'cloroquina',
            'tique-teco',
          ]}
          showButtons={true}
        />

        <div className="container">
          <div className="video-recording"></div>
          <div className="area-recording"></div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default TranslatorPT;
