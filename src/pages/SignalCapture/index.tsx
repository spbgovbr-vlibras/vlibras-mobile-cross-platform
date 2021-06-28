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

import { Strings } from './strings';
import './styles.css';

const SignalCapture = () => {
  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );
  const [log, setLog] = useState<any>('alo');
  const [thumb, setThumb] = useState(
    'file://storage/emulated/0/Android/data/lavid.ufpb.vlibras.mobile/files/files/videos/thumbailImage.jpg',
  );

  const history = useHistory();

  const takeVideo = async () => {
    if (currentVideoArray.length < 5) {
      try {
        const options = { limit: 1, duration: 30 };
        const mediafile = await VideoCapturePlus.captureVideo(options);

        let media = mediafile[0] as MediaFile;
        let path = media.fullPath.substring(0, media.fullPath.lastIndexOf('/'));
        let resolvedPath: DirectoryEntry;

        // if (Capacitor.getPlatform() === 'ios') {
        resolvedPath = await File.resolveDirectoryUrl(path);
        // } else {
        //   resolvedPath = await File.resolveDirectoryUrl('file://' + path);
        // }

        File.readAsArrayBuffer(resolvedPath.nativeURL, media.name).then(
          (buffer: any) => {
            // get the buffer and make a blob to be saved
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
                        setLog(err);
                      },
                    );
                  },
                  error => setLog(error),
                );
              })
              .catch((err: any) => {
                setLog(err);
              });
          },
          (error: any) => console.log(error),
        );

        // dispatch(
        //   Creators.setCurrentArrayVideo([
        //     ...currentVideoArray,
        //     { label: 'opa2', size: '456' },
        //   ]),
        // );
      } catch (error) {
        console.log(error + 'error geral');
      }
    }
  };

  const removeRecord = (index: any) => {
    const filteredArray = currentVideoArray.filter(
      (value: {}, i: any) => i !== index,
    );

    dispatch(Creators.setCurrentArrayVideo(filteredArray));
  };

  // const createThumbnail = (videodata: string, fname: string) => {
  //   let thumbnailoption: CreateThumbnailOptions = {
  //     fileUri: videodata,
  //     quality: 100,
  //     atTime: 1,
  //     outputFileName: fname,
  //   };

  //   try {
  //     VideoEditor.createThumbnail(thumbnailoption)
  //       .then(async (thumbnailPath: any) => {
  //         console.log('Thumbnail Responce =>', thumbnailPath);

  //         let path = thumbnailPath.substring(0, thumbnailPath.lastIndexOf('/'));
  //         let resolvedPath: DirectoryEntry;

  //         resolvedPath = await File.resolveDirectoryUrl('file://' + path);

  //         File.readAsDataURL(resolvedPath.nativeURL, fname + '.jpg').then(
  //           (path: any) => {
  //             return path;
  //           },
  //           error => '',
  //         );

  //         // return 'https://www.oficinadanet.com.br/imagens/post/24347/330xNxfundo-transparente.jpg.pagespeed.ic.c7297c4891.jpg';

  //         // return resolvedPath.nativeURL + 'thumbnailImage.jpg';
  //         // thumbnailPath = thumbnailPath.replace('thumbnailImage.jpg', '');
  //       })
  //       .catch((err: any) => {
  //         return '';
  //         setLog(err);
  //       });
  //   } catch (e) {
  //     return '';
  //   }
  // };

  const renderRecordedItens = () => {
    // setLog(JSON.stringify(currentVideoArray));
    return currentVideoArray.map((item: any, key: number) => {
      return (
        <IonItem className="item-recorder" key={key}>
          <img className="video-thumb" src={item[2].thumbBlob} />

          <div className="video-metadata">
            <p className="name"> Sinal {key + 1}</p>
            <p className="size"> {item[3].duration} seg </p>
          </div>

          <div className="video-icon-delete">
            <img src={logoTrashBtn} onClick={() => removeRecord(key)} />
          </div>
        </IonItem>
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
