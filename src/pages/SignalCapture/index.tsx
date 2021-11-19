import React, { useState } from 'react';
import { BackgroundMode } from '@ionic-native/background-mode';

import { File, DirectoryEntry } from '@ionic-native/file';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';
import {
  CreateThumbnailOptions,
  VideoEditor,
} from '@ionic-native/video-editor';
import {
  IonItem,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonPage,
  IonContent,
  IonAlert,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import {
  logoCaptureV2,
  logoTranslateVideo,
  logoTrashBtn,
  logoCaptureDisable,
  IconArrowLeft,
} from 'assets';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';
import { Capacitor } from '@capacitor/core';

import { ErrorModal, LoadingModal } from '../../components';
import paths from '../../constants/paths';
import { Strings } from './strings';

import './styles.css';

const SignalCapture = () => {
  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );
  const [showErrorModal, setShowErrorModal] = useState<[boolean, string]>([
    false,
    '',
  ]);

  const [loading, setLoading] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [showAlertpage, setShowAlertPage] = useState(false);

  const [toDelete, setToDelete] = useState<number>(-1);

  const history = useHistory();

  const takeVideoMock = async () => {
    // mock
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

  const takeVideo = async () => {
    if (currentVideoArray.length < 5) {
      try {
        const options = { limit: 1, duration: 30, highquality: true };
        // BackgroundMode.enable();
        const mediafile = await VideoCapturePlus.captureVideo(options);
        // BackgroundMode.disable();

        setLoadingDescription('Processando...');
        setLoading(true);

        const media = mediafile[0] as MediaFile;
        const path = media.fullPath.substring(
          0,
          media.fullPath.lastIndexOf('/'),
        );
        let resolvedPath: DirectoryEntry;

        if (Capacitor.getPlatform() === 'ios') {
          resolvedPath = await File.resolveDirectoryUrl('file://' + path);
        } else {
          resolvedPath = await File.resolveDirectoryUrl(path);
        }

        File.readAsArrayBuffer(resolvedPath.nativeURL, media.name).then(
          (buffer: ArrayBuffer) => {
            const imgBlob = new Blob([buffer], {
              type: media.type,
            });

            const fname = `thumb-${currentVideoArray.length}`;

            const thumbnailoption: CreateThumbnailOptions = {
              fileUri: resolvedPath.nativeURL + media.name,
              quality: 100,
              atTime: 1,
              outputFileName: fname,
            };

            VideoEditor.createThumbnail(thumbnailoption)
              .then(async (thumbnailPath: string) => {
                const pathThumbs = thumbnailPath.substring(
                  0,
                  thumbnailPath.lastIndexOf('/'),
                );
                const resolvedPathThumb: DirectoryEntry =
                  await File.resolveDirectoryUrl(`file://${pathThumbs}`);

                File.readAsDataURL(
                  resolvedPathThumb.nativeURL,
                  `${fname}.jpg`,
                ).then(
                  (thumbPath: string) => {
                    VideoEditor.getVideoInfo({
                      fileUri: resolvedPath.nativeURL + media.name,
                    }).then(
                      info => {
                        setLoading(false);
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
                        setLoading(false);
                        setShowErrorModal([
                          true,
                          'Não foi possível obter informações do vídeo',
                        ]);
                      },
                    );
                  },
                  error => {
                    setLoading(false);
                    setShowErrorModal([
                      true,
                      'Não foi possível carregar a prévia do vídeo',
                    ]);
                  },
                );
              })
              .catch((err: Error) => {
                setLoading(false);
                setShowErrorModal([
                  true,
                  'Não foi possível criar a prévia do vídeo',
                ]);
              });
          },
          (error: Error) => {
            setLoading(false);
            setShowErrorModal([true, 'Erro ao ler arquivo de vídeo']);
          },
        );
      } catch (error: any) {
        setLoading(false);
        if (error.code != 3) setShowErrorModal([true, 'Erro ao abrir câmera']);
      }
    }
  };
  function popupCancel() {
    setShowAlertPage(true);
  }
  const popupRemove = (index: number) => {
    setShowAlert(true);
    setToDelete(index);
  };

  const removeRecord = (index: number) => {
    const filteredArray = currentVideoArray.filter(
      (value: unknown, i: number) => i !== index,
    );
    dispatch(Creators.setCurrentArrayVideo(filteredArray));
  };

  const renderRecordedItens = () => {
    const fillNTimes = 5 - currentVideoArray.length;
    const copyCurrentVideo = [...currentVideoArray];

    for (let index = 0; index < fillNTimes; index += 1) {
      copyCurrentVideo.push([]);
    }

    type ArrayVideo = {
      thumbBlob: string;
      duration: number;
    };

    return copyCurrentVideo.map((item: ArrayVideo[], key: number) => {
      return (
        <>
          {item.length !== 0 ? (
            <IonItem className="item-recorder" key={uuidv4()}>
              <img
                className="video-thumb"
                src={item[2].thumbBlob}
                alt="Video Thumb"
              />

              <div className="video-metadata">
                <p className="name"> Sinal {key + 1}</p>
                <p className="size"> {item[3].duration} seg </p>
              </div>

              <div className="video-icon-delete">
                <button
                  onClick={() => popupRemove(key)}
                  type="button"
                  className="signal-capture-button-none"
                >
                  <img src={logoTrashBtn} alt="Logo lixeira" />
                </button>
              </div>
            </IonItem>
          ) : (
            <div className="item-recorder shadowing" />
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
            <button
              onClick={takeVideo}
              type="button"
              className="signal-capture-button-none"
            >
              <img
                className="button-recorder"
                src={
                  currentVideoArray.length < 5
                    ? logoCaptureV2
                    : logoCaptureDisable
                }
                alt="Logo Gravar"
              />
            </button>
            <p> Câmera </p>
          </div>
          <div className="area-button-recorder">
            <button
              onClick={translateVideo}
              type="button"
              className="signal-capture-button-none"
            >
              <img
                className="button-recorder"
                src={logoTranslateVideo}
                alt="Logo gravar"
              />
            </button>
            <p> Traduzir </p>
          </div>
        </div>

        <ErrorModal
          show={showErrorModal[0]}
          setShow={setShowErrorModal}
          errorMsg={showErrorModal[1]}
        />
        <LoadingModal
          loading={loading}
          setLoading={setLoading}
          text={loadingDescription}
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
