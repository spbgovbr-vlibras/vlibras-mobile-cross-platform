import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';

import { VideoOutputModal, RecorderArea } from 'components';
import { MenuLayout } from '../../layouts';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <RecorderArea />
      </IonContent>
    </MenuLayout>
  );
}

export default TranslatorPT;
