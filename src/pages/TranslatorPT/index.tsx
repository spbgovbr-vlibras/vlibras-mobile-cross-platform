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
  const [showRecorderArea, setShowRecorderArea] = React.useState(false);
  const [videosRecorded, setVideosRecorded] = React.useState([]);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <RecorderArea
          videosRecorded={videosRecorded}
          setVideosRecorded={setVideosRecorded}
        />

        {/* <VideoOutputModal
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
        /> */}
      </IonContent>
    </MenuLayout>
  );
}

export default TranslatorPT;
