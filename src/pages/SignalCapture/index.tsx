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
  IconArrowLeft,
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
import { CameraResultType, Capacitor } from '@capacitor/core';
import { File, DirectoryEntry } from '@ionic-native/file';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import {
  CreateThumbnailOptions,
  VideoEditor,
} from '@ionic-native/video-editor';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';

import { ErrorModal } from '../../components';

import { Strings } from './strings';
import './styles.css';
import { key } from 'ionicons/icons';
import Regionalism from 'pages/Regionalism';

const SignalCapture = () => {
  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );
  const [log, setLog] = useState<any>('alo');

  const [showErrorModal, setShowErrorModal] = useState([false, '']);

  const [showAlert, setShowAlert] = useState(false);
  const [showAlertpage, setShowAlertPage] = useState(false);

  const [toDelete, setToDelete] = useState([]);

  const history = useHistory();

  const takeVideo = async () => {
    //mock
    if (currentVideoArray.length < 5) {
      dispatch(
        Creators.setCurrentArrayVideo([
          ...currentVideoArray,
          [
            { name: 'opa', size: '123' },
            new Blob([]),
            {
              thumbBlob:
                'https://w7.pngwing.com/pngs/708/19/png-transparent-star-star-angle-triangle-symmetry-thumbnail.png',
            },
            { duration: Math.trunc(5.4) },
          ],
        ]),
      );
    }
  };

  const takeVideoOficial = async () => {
    if (currentVideoArray.length < 5) {
      try {
        const options = { limit: 1, duration: 30 };
        const mediafile = await VideoCapturePlus.captureVideo(options);

        let media = mediafile[0] as MediaFile;
        let path = media.fullPath.substring(0, media.fullPath.lastIndexOf('/'));
        let resolvedPath: DirectoryEntry;

        resolvedPath = await File.resolveDirectoryUrl(path);

        File.readAsArrayBuffer(resolvedPath.nativeURL, media.name).then(
          (buffer: any) => {
            let imgBlob = new Blob([buffer], {
              type: media.type,
            });

            const fname = `thumb-${currentVideoArray.length}`;

            let thumbnailoption: CreateThumbnailOptions = {
              fileUri: resolvedPath.nativeURL + media.name,
              quality: 100,
              atTime: 1,
              outputFileName: fname,
            };

            VideoEditor.createThumbnail(thumbnailoption)
              .then(async (thumbnailPath: any) => {
                let pathThumbs = thumbnailPath.substring(
                  0,
                  thumbnailPath.lastIndexOf('/'),
                );
                let resolvedPathThumb: DirectoryEntry;
                resolvedPathThumb = await File.resolveDirectoryUrl(
                  'file://' + pathThumbs,
                );

                File.readAsDataURL(
                  resolvedPathThumb.nativeURL,
                  fname + '.jpg',
                ).then(
                  (thumbPath: any) => {
                    VideoEditor.getVideoInfo({
                      fileUri: resolvedPath.nativeURL + media.name,
                    }).then(
                      info => {
                        dispatch(
                          Creators.setCurrentArrayVideo([
                            ...currentVideoArray,
                            [
                              ...mediafile,
                              imgBlob,
                              { thumbBlob: thumbPath },
                              { duration: Math.trunc(info.duration) },
                            ],
                          ]),
                        );
                        history.push(paths.SIGNALCAPTURE);
                      },
                      err => {
                        setShowErrorModal([
                          true,
                          'Não foi possível obter informações do vídeo',
                        ]);
                      },
                    );
                  },
                  error =>
                    setShowErrorModal([
                      true,
                      'Não foi possível carregar a prévia do vídeo',
                    ]),
                );
              })
              .catch((err: any) => {
                setShowErrorModal([
                  true,
                  'Não foi possível criar a prévia do vídeo',
                ]);
              });
          },
          (error: any) =>
            setShowErrorModal([true, 'Erro ao ler arquivo de vídeo']),
        );
      } catch (error) {
        setShowErrorModal([true, 'Erro ao abrir câmera']);
      }
    }
  };
  function popupCancel() {
    setShowAlertPage(true);
  }
  const popupRemove = (index: any) => {
    setShowAlert(true);
    setToDelete(index);
  };

  const removeRecord = (index: any) => {
    const filteredArray = currentVideoArray.filter(
      (value: {}, i: any) => i !== index,
    );
    dispatch(Creators.setCurrentArrayVideo(filteredArray));
  };

  const renderRecordedItens = () => {
    const fillNTimes = 5 - currentVideoArray.length;
    let copyCurrentVideo = [...currentVideoArray];

    for (let index = 0; index < fillNTimes; index++) {
      copyCurrentVideo.push([]);
    }

    return copyCurrentVideo.map((item: any, key: number) => {
      return (
        <>
          {item.length != 0 ? (
            <IonItem className="item-recorder" key={key}>
              <img className="video-thumb" src={item[2].thumbBlob} />

              <div className="video-metadata">
                <p className="name"> Sinal {key + 1}</p>
                <p className="size"> {item[3].duration} seg </p>
              </div>

              <div className="video-icon-delete">
                <img src={logoTrashBtn} onClick={() => popupRemove(key)} />
              </div>
            </IonItem>
          ) : (
            <div className="item-recorder shadowing"></div>
          )}
        </>
      );
    });
  };

  const translateVideo = async () => {
    history.push(paths.RECORDERAREA);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TITLE_MENU}
          </IonTitle>
          <IonButtons slot="start" onClick={popupCancel}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#969696" />
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

        <ErrorModal
          show={showErrorModal[0]}
          setShow={setShowErrorModal}
          errorMsg={showErrorModal[1]}
        />
        <IonAlert
          isOpen={showAlert}
          cssClass="popup-box-signal-cap"
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
              },
            },
            {
              text: Strings.BUTTON_NAME_NO,
              cssClass: 'popup-no',
              role: 'cancel',
              handler: () => {
                setShowAlert(false);
                console.log('Confirm No');
              },
            },
          ]}
        />
        <IonAlert
          isOpen={showAlertpage}
          cssClass="popup-box-signal-cap"
          header={Strings.TITLE_POPUP_REMOVE}
          message={Strings.MESSAGE_POPUP_REMOVE}
          buttons={[
            {
              text: Strings.BUTTON_NAME_YES,
              cssClass: 'popup-yes',
              handler: () => {
                console.log('Confirm Yes');
                dispatch(Creators.setCurrentArrayVideo([]));
                setShowAlertPage(false);
                history.goBack();
              },
            },
            {
              text: Strings.BUTTON_NAME_NO,
              cssClass: 'popup-no',
              role: 'cancel',
              handler: () => {
                console.log('Confirm No');
                setShowAlertPage(false);
              },
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SignalCapture;
