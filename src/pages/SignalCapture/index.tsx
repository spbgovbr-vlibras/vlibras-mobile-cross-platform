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
  IonAlert,
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
import { key } from 'ionicons/icons';
import Translator from 'pages/Translator';
import Regionalism from 'pages/Regionalism';
import TranslatorPT from 'pages/TranslatorPT';

const SignalCapture = () => {
  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );

  const [showAlert, setShowAlert] = useState(false);
  const [showAlertpage, setShowAlertPage] = useState(false);

  const [toDelete, setToDelete ] = useState([]);

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
function popupCancel(){

  setShowAlertPage(true)

} 
const popupRemove = (index: any) => {

setShowAlert(true)
setToDelete(index)


}

  const removeRecord = (index: any) => {
    const filteredArray = currentVideoArray.filter(
      (value: {}, i: any) => i !== index,
      
    );
console.log('Passei aqui');

  console.log('Aqui tbm');

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
      
          <img src={logoTrashBtn} onClick={() => popupRemove(key)} />

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
          <IonButtons slot="end" onClick={ popupCancel} >
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
            <div>
              <span className="tooltiptext">Grave novos sinais</span>
            </div>
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
        <IonAlert
  isOpen={showAlert}
  cssClass='popup-box' 
  header={Strings.TITLE_POPUPCANCEL}
  message={Strings.MESSAGE_POPUPCANCEL}
  buttons={[
    {
      text: Strings.BUTTON_NAME_YES,
      cssClass: 'popup-yes',
      handler: () => {
        removeRecord(toDelete);
        console.log('Confirm Yes');
        setShowAlert(false);
      }
    },
    {
      text: Strings.BUTTON_NAME_NO,
      cssClass: 'popup-no',
      role: 'cancel',
      handler: () => {
        setShowAlert(false);
        console.log('Confirm No');
      }
    }
  ]}
  /> 
          <IonAlert
  isOpen={showAlertpage}
  cssClass='popup-box-cancel' 
  header={Strings.TITLE_POPUP_REMOVE}
  message={Strings.MESSAGE_POPUP_REMOVE}
  buttons={[
    {
      text: Strings.BUTTON_NAME_YES,
      cssClass: 'popup-yes',
      handler: () => {
        console.log('Confirm Yes');
        setShowAlertPage(false);
        history.push(paths.TRANSLATORPT);
        dispatch(
          Creators.setCurrentArrayVideo([
            
          ]),
        );

      }
    },
    {
      text: Strings.BUTTON_NAME_NO,
      cssClass: 'popup-no',
      role: 'cancel',
      handler: () => {
        console.log('Confirm No');
        setShowAlertPage(false);

      }
    }
  ]}
  /> 
      </IonContent>
    </IonPage>
  );
};

export default SignalCapture;
