import React, { useState, useEffect } from 'react';

import { File, DirectoryEntry } from '@ionic-native/file';
import { VideoCapturePlus, MediaFile } from '@ionic-native/video-capture-plus';
import {
  CreateThumbnailOptions,
  VideoEditor,
} from '@ionic-native/video-editor';
import { IonContent } from '@ionic/react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { logoCapture, logoHistory, logoTranslate, logoMaos } from 'assets';
import { ErrorModal, VideoOutputModal, TranslatingModal } from 'components';
import paths from 'constants/paths';
import { MenuLayout } from 'layouts';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';

import { Strings } from './strings';

import './styles.css';

const RecorderArea = () => {
  const history = useHistory();
  const location = useLocation();

  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState([false, '']);

  const dispatch = useDispatch();
  const currentVideoArray = useSelector(
    ({ video }: RootState) => video.current,
  );

  const lastTranslation = useSelector(
    ({ video }: RootState) => video.lastTranslate,
  );

  const orderArrayByKey = (
    arrayOfResults: string[],
    arrayOfKeys: number[],
  ): string[] => {
    const newResultArray = new Array(arrayOfResults.length);

    arrayOfKeys.forEach((elem: number, key: number) => {
      newResultArray[elem] = arrayOfResults[key];
    });

    return newResultArray;
  };

  const takeVideo = async () => {
    // mock
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

  const takeVideoOf = async () => {
    try {
      const options = { limit: 1, duration: 30, highquality: true };
      const mediafile = await VideoCapturePlus.captureVideo(options);

      const media = mediafile[0] as MediaFile;
      const path = media.fullPath.substring(0, media.fullPath.lastIndexOf('/'));
      const resolvedPath: DirectoryEntry = await File.resolveDirectoryUrl(path);

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
            .catch((err: Error) => {
              setShowErrorModal([
                true,
                'Não foi possível criar a prévia do vídeo',
              ]);
            });
        },
        (error: Error) =>
          setShowErrorModal([true, 'Erro ao ler arquivo de vídeo']),
      );
    } catch (error) {
      setShowErrorModal([true, 'Erro ao abrir câmera']);
      console.log(error);
    }
  };

  const translateVideo = async () => {
    const arrayOfResults: string[] = [];
    const arrayOfKeys: number[] = [];

    setLoading(true);
    setShowModal(false);

    type ObjectType = 'string' | 'Blob';

    await Promise.all(
      currentVideoArray.map(async (item: ObjectType, key: number) => {
        const form = new FormData();
        form.append('file', item[1]);
        try {
          const resultRequest = await axios.post(
            'http://127.0.0.1:5000/api/v1/recognition',
            // 'http://lavid.nsa.root.sx:3000/api/v1/recognition',
            form,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
              },
            },
          );

          if (resultRequest.data && resultRequest.data.length > 0) {
            arrayOfResults.push(resultRequest.data[0].label);
            arrayOfKeys.push(key);
          }
          // else setShowErrorModal([true, 'Erro ao obter resultados']);
        } catch (e) {
          // setTimeout(function () {
          //   setLoading(false);
          // }, 200);
          // setLog(JSON.stringify(e.response.data));
          // console.log(e.response);
          // if (e.response && e.response.data.detail.message) {
          //   setShowErrorModal([true, e.response.data.detail.message]);
          // } else {
          //   setShowErrorModal([true, 'Erro ao enviar vídeo']);
          // }
          console.log(e);
        }
      }),
    );

    setTimeout(function () {
      setLoading(false);
    }, 200);

    const translatedLabels = orderArrayByKey(arrayOfResults, arrayOfKeys);

    if (translatedLabels.length !== 0) {
      if (translatedLabels.length === currentVideoArray.length) {
        const today = new Date();
        dispatch(
          Creators.setLastTranslator({
            data: translatedLabels,
            date: today.toLocaleDateString('pt-BR'),
            key: 'video',
          }),
        );
        setResults(translatedLabels);
        setShowModal(true);
        setLoading(false);
      } else if (translatedLabels.length < currentVideoArray.length) {
        setShowErrorModal([
          true,
          'Não foi possível traduzir todos os vídeos. Tente novamente!',
        ]);
      }
    } else {
      setShowErrorModal([true, 'Erro ao enviar vídeo']);
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
      return <span key={uuidv4()}>{item}</span>;
    });
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="main-area-recorder">
          {results.length !== 0 && (
            <>
              <div className="title-area">
                <img className="logo-icon" src={logoMaos} alt="Logo Mãos" />
                <p className="title"> Ultima tradução </p>
              </div>
              <button
                className="main-area-recorder-button-none container-output"
                type="button"
                onClick={() => history.push(paths.HISTORY)}
              >
                <div className="list-outputs">
                  <div className="container-outputs">{renderOutputs()}</div>
                </div>
              </button>
            </>
          )}
          <img
            src={logoTranslate}
            className={results.length !== 0 ? 'bg-img bg-opacity' : 'bg-img'}
            alt="Logo translate"
          />
        </div>
        <div className="fixed-area-recorder">
          <p className="title-recorder">
            Use a câmera para gravar novos sinais
          </p>
          <div className="recorder-area">
            <div className="area-button-recorder">
              <button
                onClick={takeVideo}
                type="button"
                className="main-area-recorder-button-none"
              >
                <img
                  className="button-recorder"
                  src={logoCapture}
                  alt="Logo Captura"
                />
              </button>
              <p> Câmera </p>
            </div>
            <button
              onClick={() => history.push(paths.HISTORY)}
              className="main-area-recorder-button-none"
              type="button"
            >
              <img
                className="history-recorder"
                src={logoHistory}
                alt="Logo Histórico"
              />
            </button>
          </div>
        </div>
        <TranslatingModal loading={loading} setLoading={setLoading} />
        <VideoOutputModal
          outputs={results}
          showButtons
          showModal={showModal}
          setShowModal={setShowModal}
          playerIntermedium={false}
        />
        <ErrorModal
          show={showErrorModal[0]}
          errorMsg={showErrorModal[1]}
          setShow={setShowErrorModal}
        />
      </IonContent>
    </MenuLayout>
  );
};

export default RecorderArea;
