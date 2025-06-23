import React, { useState, useCallback } from 'react';

// 1. Bibliotecas Externas
import { Capacitor } from '@capacitor/core';
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
import { File, DirectoryEntry } from '@ionic-native/file';
import { VideoCapturePlus, MediaFile } from '@ionic-native/video-capture-plus';
import {
  CreateThumbnailOptions,
  VideoEditor,
} from '@ionic-native/video-editor';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

// 2. Estado (Store), Constantes e Assets
import { RootState } from 'store';
import { Creators as VideoCreators } from 'store/ducks/video';

import { Strings } from './strings';
import {
  logoCaptureV2,
  logoTranslateVideo,
  logoTrashBtn,
  logoCaptureDisable,
  IconArrowLeft,
} from '../../assets';
import { ErrorModal, LoadingModal } from '../../components';
import paths from '../../constants/paths';

// 3. Componentes Internos

// 4. Módulos Locais e Estilos
import './styles.css';

// --- Componente Filho para o Item da Lista ---
// Extrair o item da lista para seu próprio componente é a forma correta
// de resolver o erro 'jsx-no-bind' dentro de um loop '.map()'.

type RecordedItemProps = {
  item: any[]; // Idealmente, tipar isso de forma mais estrita
  index: number;
  onRemove: (index: number) => void;
};

const RecordedItem = React.memo(
  ({ item, index, onRemove }: RecordedItemProps) => {
    const handleRemoveClick = useCallback(() => {
      onRemove(index);
    }, [index, onRemove]);

    if (item.length === 0) {
      return <div className="item-recorder shadowing" />;
    }

    return (
      <IonItem className="item-recorder" key={uuidv4()}>
        <img
          className="video-thumb"
          src={item[2].thumbBlob}
          alt="Video Thumb"
        />
        <div className="video-metadata">
          <p className="name"> Sinal {index + 1}</p>
          <p className="size"> {item[3].duration} seg </p>
        </div>
        <div className="video-icon-delete">
          <button
            onClick={handleRemoveClick}
            type="button"
            className="signal-capture-button-none">
            <img src={logoTrashBtn} alt="Logo lixeira" />
          </button>
        </div>
      </IonItem>
    );
  }
);

// --- Componente Principal ---

const SignalCapture = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentVideoArray = useSelector(
    (state: RootState) => state.video.current
  );

  const [showErrorModal, setShowErrorModal] = useState<[boolean, string]>([
    false,
    '',
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingDescription, setLoadingDescription] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showCancelAlert, setShowCancelAlert] = useState(false);
  const [videoIndexToDelete, setVideoIndexToDelete] = useState<number>(-1);

  const handleTakeVideo = useCallback(async () => {
    if (currentVideoArray.length >= 5) {
      return;
    }
    try {
      const options = { limit: 1, duration: 30, highquality: true };
      const [mediafile] = await VideoCapturePlus.captureVideo(options);

      setLoadingDescription('Processando...');
      setLoading(true);

      const media = mediafile as MediaFile;
      const path = media.fullPath.substring(0, media.fullPath.lastIndexOf('/'));

      const resolvedPath =
        Capacitor.getPlatform() === 'ios'
          ? await File.resolveDirectoryUrl(`file://${path}`)
          : await File.resolveDirectoryUrl(path);

      const buffer = await File.readAsArrayBuffer(
        resolvedPath.nativeURL,
        media.name
      );
      const imgBlob = new Blob([buffer], { type: media.type });

      const fname = `thumb-${uuidv4()}`;
      const thumbnailOptions: CreateThumbnailOptions = {
        fileUri: resolvedPath.nativeURL + media.name,
        quality: 100,
        atTime: 1,
        outputFileName: fname,
      };

      const thumbnailPath = await VideoEditor.createThumbnail(thumbnailOptions);
      const pathThumbs = thumbnailPath.substring(
        0,
        thumbnailPath.lastIndexOf('/')
      );
      const resolvedPathThumb = await File.resolveDirectoryUrl(
        `file://${pathThumbs}`
      );

      const thumbDataUrl = await File.readAsDataURL(
        resolvedPathThumb.nativeURL,
        `${fname}.jpg`
      );

      const videoInfo = await VideoEditor.getVideoInfo({
        fileUri: resolvedPath.nativeURL + media.name,
      });

      dispatch(
        VideoCreators.setCurrentArrayVideo([
          ...currentVideoArray,
          [
            mediafile,
            imgBlob,
            { thumbBlob: thumbDataUrl },
            { duration: Math.trunc(videoInfo.duration) },
          ],
        ])
      );
    } catch (error: any) {
      if (error.code !== 3) {
        // Ignora erro de cancelamento do usuário
        setShowErrorModal([true, 'Ocorreu um erro ao usar a câmera.']);
      }
    } finally {
      setLoading(false);
    }
  }, [currentVideoArray, dispatch]);

  const handleTranslateVideo = useCallback(() => {
    history.push(paths.RECORDERAREA);
  }, [history]);

  const handleRemoveRecord = useCallback(() => {
    const filteredArray = currentVideoArray.filter(
      (value: unknown, i: number) => i !== videoIndexToDelete
    );
    dispatch(VideoCreators.setCurrentArrayVideo(filteredArray));
    setShowDeleteAlert(false);
  }, [currentVideoArray, dispatch, videoIndexToDelete]);

  const handleOpenDeleteAlert = useCallback((index: number) => {
    setVideoIndexToDelete(index);
    setShowDeleteAlert(true);
  }, []);

  const handleConfirmCancelPage = useCallback(() => {
    dispatch(VideoCreators.setCurrentArrayVideo([]));
    setShowCancelAlert(false);
    history.goBack();
  }, [dispatch, history]);

  // Renderiza a lista de espaços para gravação
  const renderRecordedItems = () => {
    const items = [];
    for (let i = 0; i < 5; i += 1) {
      items.push(
        currentVideoArray[i] ? (
          <RecordedItem
            key={i}
            item={currentVideoArray[i]}
            index={i}
            onRemove={handleOpenDeleteAlert}
          />
        ) : (
          <div key={i} className="item-recorder shadowing" />
        )
      );
    }
    return items;
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TITLE_MENU}
          </IonTitle>
          <IonButtons slot="start" onClick={() => setShowCancelAlert(true)}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#969696" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="list-captures">
          <p className="progress-recorder"> {currentVideoArray.length} de 5 </p>
          <div className="list-recorded-itens">{renderRecordedItems()}</div>
        </div>

        <div className="new-recorder-area">
          <div className="area-button-recorder">
            <div>
              <span className="tooltiptext">Grave novos sinais</span>
            </div>
            <button
              onClick={handleTakeVideo}
              type="button"
              className="signal-capture-button-none">
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
              onClick={handleTranslateVideo}
              type="button"
              className="signal-capture-button-none">
              <img
                className="button-recorder"
                src={logoTranslateVideo}
                alt="Logo traduzir"
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
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          cssClass="popup-box-signal-cap"
          header={Strings.TITLE_POPUP_REMOVE}
          message={Strings.MESSAGE_POPUP_REMOVE}
          buttons={[
            {
              text: Strings.BUTTON_NAME_NO,
              role: 'cancel',
              cssClass: 'popup-no',
            },
            {
              text: Strings.BUTTON_NAME_YES,
              cssClass: 'popup-yes',
              handler: handleRemoveRecord,
            },
          ]}
        />
        <IonAlert
          isOpen={showCancelAlert}
          onDidDismiss={() => setShowCancelAlert(false)}
          cssClass="popup-box-signal-cap"
          header={Strings.TITLE_POPUPCANCEL}
          message={Strings.MESSAGE_POPUPCANCEL}
          buttons={[
            {
              text: Strings.BUTTON_NAME_NO,
              role: 'cancel',
              cssClass: 'popup-no',
            },
            {
              text: Strings.BUTTON_NAME_YES,
              cssClass: 'popup-yes',
              handler: handleConfirmCancelPage,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default SignalCapture;
