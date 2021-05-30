import React from 'react';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/react';

import { OnBoarding, VideoOutputModal } from 'components';
import { MenuLayout } from '../../layouts';

import { Strings } from './strings';
import './styles.css';

function TranslatorPT() {
  const [metadata, setMetadata] = React.useState({});
  const [videoSrc, setVideoSrc] = React.useState('');

  async function takeVideo() {
    try {
      const options = { limit: 1, duration: 30 };
      const mediafile = await VideoCapturePlus.captureVideo(options);
      setMetadata(mediafile);
      setVideoSrc(mediafile[0].fullPath);
    } catch (error) {
      setMetadata(error);
    }
  }

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <OnBoarding />
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
        {/* 
        <div className="container">
          <div className="video-recording"></div>
          <div className="area-recording">
            <button className="home-button-record" onClick={takeVideo}>
              Opaa
            </button>

            <p className="home-vide-info">{JSON.stringify(metadata)}</p>
            <p className="home-vide-info">{videoSrc}</p>
          </div>
        </div> */}
      </IonContent>
    </MenuLayout>
  );
}

export default TranslatorPT;
