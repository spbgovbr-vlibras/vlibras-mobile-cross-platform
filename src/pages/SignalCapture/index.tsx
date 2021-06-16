import React, { useState } from 'react';
import { IconCloseCircle } from 'assets';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';

import {
  logoCaptureV2,
  logoTranslateVideo,
  logoTrashBtn,
  logoCaptureDisable,
} from '../../assets';

import {
  IonButton,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonMenuButton,
  IonPage,
  IonContent,
} from '@ionic/react';
import { MenuLayout } from '../../layouts';
import paths from '../../constants/paths';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';

import { Strings } from './strings';
import './styles.css';

const SignalCapture = () => {
  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );

  const history = useHistory();

  const takeVideo = async () => {
    if (currentVideoArray.length < 5) {
      try {
        // const options = { limit: 1, duration: 30 };
        // const mediafile = await VideoCapturePlus.captureVideo(options);
        // dispatch(
        //   Creators.setCurrentArrayVideo([...currentVideoArray, ...mediafile]),
        // );

        dispatch(
          Creators.setCurrentArrayVideo([
            ...currentVideoArray,
            { label: 'opa2', size: '456' },
          ]),
        );
      } catch (error) {
        console.log(error);
      }
    }
  };

  const removeRecord = (index: any) => {
    const filteredArray = currentVideoArray.filter(
      (value: {}, i: any) => i !== index,
    );

    dispatch(Creators.setCurrentArrayVideo(filteredArray));
  };

  const renderRecordedItens = () => {
    return currentVideoArray.map((item: any, key: number) => (
      <IonItem className="item-recorder" key={key}>
        <div className="video-thumb"> </div>
        <div className="video-metadata">
          <p className="name"> Sinal {key + 1}</p>
          <p className="size"> {item.size} kb </p>
        </div>
        <div className="video-icon-delete">
          <img src={logoTrashBtn} onClick={() => removeRecord(key)} />
        </div>
      </IonItem>
    ));
  };

  const translateVideo = async () => {
    history.push(paths.TRANSLATORPT);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TITLE_MENU}
          </IonTitle>
          <IonButtons slot="end">
            <div className="menu-container-end">
              <IconCloseCircle color="#969696" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="list-captures">
          <p className="progress-recorder"> {currentVideoArray.length} de 5 </p>
          <div className="list-recorded-itens">{renderRecordedItens()}</div>
        </div>
        <div className="new-recorder-area">
          <div className="area-button-recorder">
            <img
              className="button-recorder"
              src={
                currentVideoArray.length < 5
                  ? logoCaptureV2
                  : logoCaptureDisable
              }
              onClick={takeVideo}
            ></img>
            <p> Câmera </p>
          </div>
          <div className="area-button-recorder">
            <img
              className="button-recorder"
              src={logoTranslateVideo}
              onClick={translateVideo}
            ></img>
            <p> Traduzir </p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SignalCapture;
