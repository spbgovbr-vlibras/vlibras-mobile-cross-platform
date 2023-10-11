/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable quotes */
/* eslint-disable import/order */
/* eslint-disable react/button-has-type */
import { IonPopover, isPlatform } from '@ionic/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import Unity from 'react-unity-webgl';

import {
  IconDictionary,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconRunning,
  IconPause,
  IconShare,
  IconThumbs,
  IconClose,
  logoRefresh,
  logoSubtitleOn,
  logoSubtitleOff,
  IcaroAvatar,
  HozanaAvatar,
  GugaAvatar,
  IconSubtitle,
} from 'assets';
import EvaluationModal from 'components/EvaluationModal';
import TutorialPopover from 'components/TutorialPopover';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { Avatar, TranslationRequestType } from 'constants/types';
import { useTranslation } from 'hooks/Translation';
import { TutorialSteps, useTutorial } from 'hooks/Tutorial';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/customization';
import { Creators as CreatorsVideo } from 'store/ducks/video';
import './styles.css';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getVideo, postVideo } from 'services/shareVideo';
import GenerateModal from 'components/GenerateModal';
import { Device } from '@capacitor/device';
import ErrorModal from 'components/ErrorModal';

type BooleanParamsPlayer = 'True' | 'False';

const playerService = PlayerService.getService();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

const X1 = 1;
const X2 = 2;
const X3 = 3;
const UNDEFINED_GLOSS = -1;
const MAX_PROGRESS = 100;

function toBoolean(flag: BooleanParamsPlayer): boolean {
  return flag === 'True';
}

function toInteger(flag: boolean): number {
  return flag ? 1 : 0;
}

let recording = false;
let isLoading = false;
let contador = 60;
let isBreak = false;

let mediaRecorder: MediaRecorder;
let recordedChunks: BlobPart[] | undefined;
const info = Device.getInfo();

function Player() {
  const errorMessage = 'Erro ao compartilhar o vídeo. Tente novamente.';

  const [modalOpen, setModalOpen] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);

  const openErrorModal = () => {
    setErrorModalOpen(true);
    closeModal();
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleClick = () => {
    setShowCloseButton(false);
    if (!recording && isLoading) {
      openModal();
    }
  };

  const onBreak = () => {
    closeModal();
    isBreak = !isBreak;
  };

  const handleVideoReading = (fileReader: FileReader, blob: Blob) => {
    fileReader.readAsDataURL(blob);
    return async () => {
      const base64data = fileReader.result as string;
      const uri = await Filesystem.writeFile({
        path: 'VLibras.mp4',
        data: base64data,
        directory: Directory.Cache,
        recursive: true,
      });
      try {
        await Share.share({
          title: 'Compartilhar',
          text: 'Compartilhando tradução.',
          url: uri.uri,
        });
      } catch (error: unknown) {
        /** ignore */
      }
      closeModal();
      isLoading = false;
    };
  };

  // INCIA A GRAVAÇÃO DO VIDEO E SALVA EM FORMATO "WEBM".
  async function initRecorder() {
    const mimeType =
      (await info).platform === ('android'||'web') ? 'video/webm' : 'video/webm';
    const canvas = document.querySelector('canvas');
    const stream = canvas?.captureStream(25);
    if (stream) {
      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
      });
      recordedChunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunks?.push(e.data);
        }
      };
      mediaRecorder.start();
    }
  }

  // FUNÇÃO RECURSIRVA QUE VERIFICA SE O BLOB ESTÁ CONVERTIDO PARA "MP4"
  // E FAZ CHAMADA NO SERVIDOR PARA PEGAR O VIDEO E COMPARTILHAR.
  const checkBlob = (count: number, id: string) => {
    setTimeout(async () => {
      if (count === 0 || !isLoading) {
        let blob = new Blob();
        try {
          blob = await getVideo(id);
        } catch (_) {
          openErrorModal();
          isLoading = false;
        }
        const reader = new FileReader();
        reader.onloadend = handleVideoReading(reader, blob);
        return;
      }
      if (count > 0 || isLoading) {
        try {
          const blob = await getVideo(id);
          if (blob.size > 24) {
            closeModal();
            isLoading = false;
          }
        } catch (_) {
          isLoading = false;
          openErrorModal();
        }
      }
      if (count === 51) {
        setShowCloseButton(true);
      }
      if (isBreak) {
        isBreak = !isBreak;
        return;
      }
      checkBlob(count - 1, id);
    }, 1000);
  };

  // STOPA/PARA A GRAVAÇÃO DO VIDEO E VERIFICA QUAL É O SISTEMA OPERACIONAL,
  // SE FOR ANDROID, ENVIA O ARQUVIO "WEBM" PARA O SERVIDOR PARA SER CONVERTIDO.
  async function initVideoSharing() {
    isLoading = true;
    if ((await info).platform === 'android') {
      let id = '';
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      try {
        id = await postVideo({ blob: blob });
        const jsonId = JSON.stringify(id);
        if (jsonId !== '') {
          checkBlob(contador, id);
        }
      } catch (_) {
        openErrorModal();
      }
    }
    if ((await info).platform === 'ios') {
      const blob = new Blob(recordedChunks, {
        type: 'video/mp4',
      });

      const reader = new FileReader();
      reader.onloadend = handleVideoReading(reader, blob);
    }
  }

  const [popoverState, setShowPopover] = useState({
    showPopover: false,
    event: undefined,
  });
  const history = useHistory();
  const { currentStep, goNextStep, onCancel } = useTutorial();

  const { generateVideo, textGloss } = useTranslation();

  const currentAvatar = useSelector(
    ({ customization }: RootState) => customization.currentavatar
  );

  const currentBody = useSelector(
    ({ customization }: RootState) => customization.currentbody
  );
  const currentEye = useSelector(
    ({ customization }: RootState) => customization.currenteye
  );

  const currentHair = useSelector(
    ({ customization }: RootState) => customization.currenthair
  );

  const currentShirt = useSelector(
    ({ customization }: RootState) => customization.currentshirt
  );

  const currentPants = useSelector(
    ({ customization }: RootState) => customization.currentpants
  );

  // Dynamic states [MA]
  // const [currentAvatar, setCurrentAvatar] = useState<Avatar>('icaro');
  const [visiblePlayer, setVisiblePlayer] = useState(false);
  const [speedValue, setSpeedValue] = useState(X1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [isShowSubtitle, setIsShowSubtitle] = useState(true);

  // Reference to handle the progress bar [MA]
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const dispatch = useDispatch();

  let glossLen = UNDEFINED_GLOSS;
  let cache = UNDEFINED_GLOSS;

  // To avoid the unity splash screen [MA]
  useEffect(() => {
    playerService.getUnity().on('progress', (progression: number) => {
      if (progression === 1) {
        dispatch(Creators.loadAvatar.request({currentAvatar}));
        dispatch(Creators.loadCustomization.request({}));
        setVisiblePlayer(true);
      }
    });
  }, [dispatch]);  

  function handlePlay(gloss: string) {
    if (progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
    }
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
  }
  const translatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText
  );

  function handleStop() {
    translatorText !== ''
      ? history.push(paths.TRANSLATOR)
      : history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
    setHasFinished(false);
  }

  // Evaluation modal
  const [showModal, setShowModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [submittedRevision, setSubmittedRevision] = useState(false);
  const [showSuggestionFeedbackModal, setShowSuggestionFeedbackModal] =
    useState(false);

  window.onPlayingStateChange = (
    _isPlaying: BooleanParamsPlayer,
    _isPaused: BooleanParamsPlayer,
    _isPlayingIntervalAnimation: BooleanParamsPlayer,
    _isLoading: BooleanParamsPlayer,
    _isRepeatable: BooleanParamsPlayer
  ) => {
    setIsPlaying(toBoolean(_isPlaying));
    setIsPaused(toBoolean(_isPaused));

    if (toBoolean(_isPlaying) && recording === false) {
      initRecorder();
      recording = true;
    }
    if (!toBoolean(_isPlaying)) {
      setHasFinished(true);
    }
    if (!toBoolean(_isPlaying) && recording === true) {
      mediaRecorder.stop();
      recording = false;
    }
  };

  function resetTranslation() {
    setHasFinished(false);
    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'hidden';
      progressContainerRef.current.style.width = '0%';
      progressBarRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.width = '0%';
    }
  }

  useEffect(() => {
    if (location.pathname === paths.HOME) resetTranslation();
  }, [location]);

  useEffect(() => {
    if (hasFinished === false) {
      setSubmittedRevision(false);
    }
  }, [setSubmittedRevision, hasFinished]);

  const onSubmittedRevision = useCallback(() => {
    setSubmittedRevision(true);
  }, []);

  window.CounterGloss = (counter: number, glossLength: number) => {
    if (counter === cache - 1) {
      glossLen = counter;
    }
    cache = counter;

    const progress = (1 / glossLen) * 100;

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = `${
        progress > MAX_PROGRESS ? MAX_PROGRESS : progress
      }%`;
    }
    dispatch(CreatorsVideo.setProgress(progress));
  };

  function handlePause() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_PAUSE_STATE,
      toInteger(!isPaused)
    );
  }

  function handleSpeed(speed: number) {
    setSpeedValue(speed);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.SET_SLIDER, speed);
    setShowPopover({ showPopover: false, event: undefined });
  }

  function handleChangeAvatar() {
    if (currentAvatar === 'icaro') {
      dispatch(Creators.setCurrentAvatar('hozana'))
    } else if (currentAvatar === 'hozana') {
      dispatch(Creators.setCurrentAvatar('guga'))
    } else {
      dispatch(Creators.setCurrentAvatar('icaro'))
    }

    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.CHANGE_AVATAR,
      currentAvatar
    );
  }

  function handleSubtitle() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_SUBTITLE_STATE,
      toInteger(!isShowSubtitle)
    );
    setIsShowSubtitle(!isShowSubtitle);
  }

  function handleShare() {
    generateVideo({
      calca: currentPants,
      camisa: currentShirt,
      cabelo: currentHair,
      corpo: currentBody,
      olhos: currentEye,
      avatar: currentAvatar,
    });
  }

  const renderPlayerButtons = () => {
    if (isPlaying) {
      return (
        <>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={(e: any) => {
              e.persist();
              setShowPopover({ showPopover: true, event: e });
            }}>
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={handlePause}>
            {isPaused ? (
              <IconPauseOutlined color={buttonColors.VARIANT_BLUE} size={24} />
            ) : (
              <IconPause color={buttonColors.VARIANT_BLUE} size={24} />
            )}
          </button>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={handleSubtitle}>
            {isShowSubtitle ? (
              <img src={logoSubtitleOn} alt="refresh" />
            ) : (
              <img src={logoSubtitleOff} alt="refresh" />
            )}
          </button>
        </>
      );
    }
    if (hasFinished) {
      return (
        <>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={(e: any) => {
              e.persist();
              setShowPopover({ showPopover: true, event: e });
            }}>
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={() => handlePlay(textGloss)}>
            <img src={logoRefresh} alt="refresh" />
          </button>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={handleSubtitle}>
            {isShowSubtitle ? (
              <img src={logoSubtitleOn} alt="refresh" />
            ) : (
              <img src={logoSubtitleOff} alt="refresh" />
            )}
          </button>
        </>
      );
    }
    return (
      <>
        <div
          style={{
            position: 'relative',
          }}>
          <div
            style={{
              marginRight: 6,
              position: 'absolute',
              width: '100vw',
              bottom: 50,
              left: 0,
            }}>
            <TutorialPopover
              title="Dicionário"
              description="Consulte os sinais disponíveis no vlibras"
              position="bl"
              isEnabled={currentStep === TutorialSteps.DICTIONARY}
            />
          </div>
          {currentStep === TutorialSteps.PLAYBACK_SPEED 
            ? (
              <IconRunning color={buttonColors.VARAINT_WHITE} size={32} />
            ):(
              <button
                className="player-action-button-transparent"
                type="button"
                onClick={() => {
                  history.push(paths.DICTIONARY_PLAYER);
                  onCancel();
                }}>
                <IconDictionary color={buttonColors.VARAINT_WHITE} />
              </button>
            )}
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 0,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Tradução PT-BR"
              description="Escreva ou cole o texto para ser traduzido"
              position="bc"
              isEnabled={currentStep === TutorialSteps.TRANSLATION}
            />
          </div>
        </div>
        <button
          className="player-action-button player-action-button-insert"
          type="button"
          onClick={() => {
            history.push(paths.TRANSLATOR);
            onCancel();
            }}>
          <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
        </button>

        <div
          style={{
            margin: 'auto',
            position: 'absolute',
            bottom: 60,
            left: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            paddingRight: '28px',
          }}>
          <TutorialPopover
            title="Histórico"
            description="Acesse as traduções dos últimos 30 dias"
            position="br"
            isEnabled={currentStep === TutorialSteps.HISTORY}
          />
        </div>
        {currentStep === TutorialSteps.SUBTITLE ? (
          <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
        ) : (
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={() => {
              history.push(paths.HISTORY);
              onCancel();
              }}>
            <IconHistory color={buttonColors.VARAINT_WHITE} size={32} />
          </button>
        )}

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Legenda"
              description="Habilite legenda para tradução"
              position="br"
              isEnabled={currentStep === TutorialSteps.SUBTITLE}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Velocidade de reprodução"
              description="Altere a velocidade de reprodução"
              position="bl"
              isEnabled={currentStep === TutorialSteps.PLAYBACK_SPEED}
            />
          </div>
        </div>
      </>
    );
  };

  useEffect(() => {
    const preProcessingPreview = JSON.stringify({
      avatar: currentAvatar,
      corpo: currentBody,
      olhos: '#fffafa',
      cabelo: currentHair,
      camisa: currentShirt,
      calca: currentPants,
      iris: currentEye,
      pos: 'center',
    });
    console.log(preProcessingPreview);
    playerService.send(
      PlayerKeys.AVATAR,
      PlayerKeys.SETEDITOR,
      preProcessingPreview
    );    

  }, [currentBody, currentHair, currentShirt, currentPants, currentEye, currentAvatar]);

  return (
    <div className="player-container">
      <div
        style={{
          position: 'absolute',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 2,
        }}>
        <TutorialPopover
          title="Menu"
          description="Informações e ajustes adicionais do tradudor"
          position="tl"
          isEnabled={currentStep === TutorialSteps.MENU}
        />
      </div>
      <IonPopover
        className="player-popover"
        event={popoverState.event}
        isOpen={popoverState.showPopover}
        onDidDismiss={() =>
          setShowPopover({ showPopover: false, event: undefined })
        }>
        <div className="player-popover-content">
          <button
            className={
              speedValue === X3
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X3)}>
            <span>X3</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X2
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X2)}>
            <span>X2</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X1
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X1)}>
            <span>X1</span>
          </button>
        </div>
      </IonPopover>
      <div className="player-container-button">
        {isPlaying || hasFinished ? (
          <button
            className="player-button-rounded-top"
            type="button"
            onClick={handleStop}>
            <IconClose color="#FFF" size={24} />
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: 6 }}>
              <TutorialPopover
                title="Trocar avatar"
                description="Alterne entre os avatares disponíveis"
                position="rb"
                isEnabled={currentStep === TutorialSteps.CHANGE_AVATAR}
              />
            </div>
            <button
              className="player-button-avatar-rounded-top"
              type="button"
              onClick={handleChangeAvatar}>
              {currentAvatar === 'icaro' && <HozanaAvatar />}
              {currentAvatar === 'hozana' && <GugaAvatar />}
              {currentAvatar === 'guga' && <IcaroAvatar />}
            </button>
          </div>
        )}
      </div>
      <div
        style={{
          width: '100vw',
          zIndex: 0,
          flexShrink: 0,
          marginBottom: 70,
          flex: 1,
          display: 'flex',
          background: isPlatform('ios') && visiblePlayer ? 'black' : '#E5E5E5',
        }}>
        <Unity
          unityContent={playerService.getUnity()}
          className="player-content"
        />
      </div>

      {(currentStep === TutorialSteps.LIKED_TRANSLATION ||
        currentStep === TutorialSteps.SHARE ||
        (hasFinished && !isPlaying)) && (
        <div className="player-container-buttons">
          <div
            style={{
              top: -54,
              position: 'absolute',
              right: 10,
            }}>
            <TutorialPopover
              title="Gostou da tradução?"
              description="Avalie e sugira melhorias."
              position="br"
              isEnabled={currentStep === TutorialSteps.LIKED_TRANSLATION}
            />
          </div>
          {!submittedRevision && (
            <button
              disabled={currentStep === TutorialSteps.LIKED_TRANSLATION}
              className="player-button-rounded"
              type="button"
              onClick={() => setShowModal(true)}>
              <IconThumbs color="#FFF" size={18} />
            </button>
          )}
          <div
            style={{
              top: -2,
              position: 'absolute',
              right: 10,
            }}>
            <TutorialPopover
              title="Compartilhar"
              description="Vídeo com a tradução"
              position="br"
              isEnabled={currentStep === TutorialSteps.SHARE}
            />
          </div>
          <button
            disabled={
              currentStep === TutorialSteps.SHARE ||
              currentStep === TutorialSteps.LIKED_TRANSLATION
            }
            className="player-button-rounded"
            type="button"
            onClick={() => {
              // // STOPANDO A GRAVAÇÃO E COMPARTILHANDO O ARQUIVO GRAVADO
              if (!recording) {
                initVideoSharing();
                handleClick();
              }
            }}>
            <IconShare color="#FFF" size={18} />
          </button>
          <GenerateModal
            visible={modalOpen}
            setVisible={closeModal}
            translationRequestType={TranslationRequestType.VIDEO_SHARE}
            showCloseButton={showCloseButton}
            onBreak={onBreak}
          />
          <ErrorModal
            show={errorModalOpen}
            setShow={closeErrorModal}
            errorMsg={errorMessage}
          />
        </div>
      )}
      <div className="player-action-container">
        <div ref={progressContainerRef} className="player-progress-container">
          <div ref={progressBarRef} className="player-progress-bar" />
        </div>
        <div className="play-action-content">{renderPlayerButtons()}</div>
      </div>

      <EvaluationModal
        show={showModal}
        setShow={setShowModal}
        showYes={showYesModal}
        setShowYes={setShowYesModal}
        showNo={showNoModal}
        setShowNo={setShowNoModal}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setSuggestionFeedbackModal={setShowSuggestionFeedbackModal}
        isPlaying={isPlaying}
        onSubmittedRevision={onSubmittedRevision}
      />
      {TutorialSteps.INITIAL === currentStep && (
        <div className="tutorial-box-shadow">
          <h1>Veja como usar</h1>
          <div style={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
            <button className="button-outlined" onClick={onCancel}>
              Pular
            </button>
            <button className="button-solid" onClick={goNextStep}>
              Iniciar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Player;
