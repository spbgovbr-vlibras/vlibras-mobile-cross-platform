import React, { Dispatch, SetStateAction, useState, useEffect } from 'react';
import {
  logoCapture,
  logoHistory,
  logoTranslate,
  logoMaos,
} from '../../assets';
import { useHistory, useLocation } from 'react-router-dom';
import paths from '../../constants/paths';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';
import { File, DirectoryEntry } from '@ionic-native/file';
import { CameraResultType, Capacitor } from '@capacitor/core';

import { IonContent } from '@ionic/react';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';
import {
  CreateThumbnailOptions,
  VideoEditor,
} from '@ionic-native/video-editor';

import {
  VideoCapturePlus,
  VideoCapturePlusOptions,
  MediaFile,
} from '@ionic-native/video-capture-plus';
import {
  VideoOutputModal,
  TranslatingModal,
  ErrorModal,
} from '../../components';

import './styles.css';

const RecorderArea = () => {
  const history = useHistory();
  const location = useLocation();

  const [results, setResults] = React.useState<any>([]);
  const [loading, setLoading] = React.useState<any>(false);
  const [toogleResult, setToogleResult] = React.useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState([false, '']);

  const [log, setLog] = useState('');

  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );

  const lastTranslation = useSelector(
    ({ video }: RootState) => video.lastTranslate,
  );
  const takeVideo = async () => {
    //mock
    if (currentVideoArray.length < 5) {
      dispatch(
        Creators.setCurrentArrayVideo([
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
      history.push(paths.SIGNALCAPTURE);
    }
  };

  const takeVideoOficial = async () => {
    try {
      const options = { limit: 1, duration: 30 };
      let mediafile = await VideoCapturePlus.captureVideo(options);

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
      console.log(error);
    }
  };

  const translateVideo = async () => {
    const arrayOfResults: any = [];

    setLoading(true);
    setShowModal(false);

    await Promise.all(
      currentVideoArray.map(async (item: any, key: number) => {
        const form = new FormData();
        form.append('file', item[1]);

        try {
          const resultRequest = await axios.post(
            // 'http://127.0.0.1:5000/api/v1/recognition',
            'http://lavid.nsa.root.sx:3000/api/v1/recognition',
            form,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
              },
            },
          );

          if (resultRequest.data && resultRequest.data.length > 0)
            arrayOfResults.push(resultRequest.data[0].label);
          else setShowErrorModal([true, 'Erro ao obter resultados']);
        } catch (e) {
          // arrayOfResults.push('dor de cabeça', 'alergia');
          setShowErrorModal([true, 'Erro ao enviar vídeo']);

          console.log(e);
        }
      }),
    );

    setLoading(false);

    if (arrayOfResults.length != 0) {
      dispatch(Creators.setLastTranslator(arrayOfResults));
      setResults(arrayOfResults);
      setShowModal(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (
      location.pathname === paths.RECORDERAREA &&
      currentVideoArray.length > 0
    ) {
      translateVideo();
    }
  }, [location]);

  const renderOutputs = () => {
    return lastTranslation.map((item: string, key: string) => {
      return <span key={key}>{item}</span>;
    });
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div
          className="main-area-recorder"
          onClick={() => setToogleResult(!toogleResult)}
        >
          {results.length != 0 && (
            <>
              <div className="title-area">
                <img className="logo-icon" src={logoMaos} />
                <p className="title"> Ultima tradução </p>
              </div>
              <div
                className="list-outputs"
                onClick={() => history.push(paths.HISTORY)}
              >
                <div className="container-outputs">{renderOutputs()}</div>
              </div>
            </>
          )}
          <img
            src={logoTranslate}
            className={results.length != 0 ? 'bg-img bg-opacity' : 'bg-img'}
          ></img>
        </div>
        <div className="fixed-area-recorder">
          <p className="title-recorder">
            Use a câmera para gravar novos sinais
          </p>
          <div className="recorder-area">
            <div className="area-button-recorder">
              <img
                className="button-recorder"
                src={logoCapture}
                onClick={takeVideo}
                // onClick={() => history.push(paths.SIGNALCAPTURE)}
              ></img>
              <p> Câmera </p>
            </div>
            <img
              className="history-recorder"
              src={logoHistory}
              onClick={() => history.push(paths.HISTORY)}
            ></img>
          </div>
        </div>
        <TranslatingModal loading={loading} setLoading={setLoading} />
        <VideoOutputModal
          outputs={results}
          showButtons={true}
          showModal={showModal}
          setShowModal={setShowModal}
          playerIntermedium={false}
        />
        <ErrorModal
          show={showErrorModal[0]}
          setShow={setShowErrorModal}
          errorMsg={showErrorModal[1]}
        />
      </IonContent>
    </MenuLayout>
  );
};

export default RecorderArea;
