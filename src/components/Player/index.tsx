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
import { App, StateChangeListener } from '@capacitor/app';

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
  IconRefresh,
  IconTutorial,
} from 'assets';
import EvaluationModal from 'components/EvaluationModal';
import TutorialPopover from 'components/TutorialPopover';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { TranslationRequestType } from 'constants/types';
import { useTranslation } from 'hooks/Translation';
import { TutorialSteps, useTutorial } from 'hooks/Tutorial';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/customization';
import { Creators as CreatorLoading } from 'store/ducks/loadingAction';
import { Creators as CreatorsVideo } from 'store/ducks/video';
import './styles.css';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { getVideo, postVideo } from 'services/shareVideo';
import GenerateModal from 'components/GenerateModal';
import { Device } from '@capacitor/device';
import ErrorModal from 'components/ErrorModal';
import {
  useOnCounterGloss,
  useOnFinisheWelcome,
  useOnPlayingStateChangeHandler,
} from 'hooks/unityHooks';
import { Strings } from './Strings';

import { useLoadCurrentAvatar } from 'hooks/useLoadCurrentAvatar';
import { updateAvatarCustomizationProperties } from 'data/AvatarCustomizationProperties';

const playerService = PlayerService.getPlayerInstance();

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
  const [tryShowTutorial, setTryShowTutorial] = useState(false);
  const [visiblePlayer, setVisiblePlayer] = useState(false);
  const [speedValue, setSpeedValue] = useState(X1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [isShowSubtitle, setIsShowSubtitle] = useState(true);
  const [popoverState, setShowPopover] = useState<{
    showPopover: boolean;
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  }>({
    showPopover: false,
    event: undefined,
  });
  const [hasLoadedAvatarOnce, setHasLoadedAvatarOnce] = useState(false);
  const [isInBackground, setIsInBackground] = useState(false);
  const [shouldUnPauseOnForeground, setShouldUnPauseOnForeground] =
    useState(false);

  const history = useHistory();
  history.listen(() => {
    location.pathname !== '/' ? onCancel() : null;
  });

  const {
    currentStep,
    goNextStep,
    onCancel,
    hasLoadedConfigurations: hasLoadedTutotiralConfigurations,
  } = useTutorial();
  const { textGloss } = useTranslation();

  const wasPlaying = useRef<boolean>(false);
  // Reference to handle the progress bar [MA]
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const dispatch = useDispatch();

  const tutorialHandler = (hasFinished: boolean) => {
    if (hasFinished) {
      setTryShowTutorial(true);
      handleStop();
    }
  };

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
        path: Strings.VIDEO_SHARE_FILENAME,
        data: base64data,
        directory: Directory.Cache,
        recursive: true,
      });
      try {
        await Share.share({
          dialogTitle: Strings.VIDEO_SHARE_TITLE_DIALOG,
          title: Strings.VIDEO_SHARE_TITLE_DIALOG,
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
  const initRecorder = async () => {
    const platform = (await info).platform;
    const mimeType = ['android', 'web'].includes(platform)
      ? 'video/webm'
      : 'video/mp4';

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
  };

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
  const initVideoSharing = async () => {
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
  };

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

  let glossLen = UNDEFINED_GLOSS;
  let cache = UNDEFINED_GLOSS;

  useEffect(() => {
    const handleAppStateChange: StateChangeListener = ({ isActive }) => {
      // isActive is true if the app is in the foreground, and false if in background
      setIsInBackground(!isActive);
    };

    // Add the app state change listener
    const listener = App.addListener('appStateChange', handleAppStateChange);

    // Clean up the event listener when component unmounts
    return () => {
      listener.remove();
    };
  }, []);

  useEffect(() => {
    if (isInBackground && !isPaused && !shouldUnPauseOnForeground) {
      setShouldUnPauseOnForeground(true);
      handlePause();
    }
  }, [shouldUnPauseOnForeground, isInBackground, isPaused]);

  useEffect(() => {
    if (shouldUnPauseOnForeground && !isInBackground && isPaused) {
      setShouldUnPauseOnForeground(false);
      handlePause();
    }
  }, [shouldUnPauseOnForeground, isInBackground, isPaused]);

  useOnFinisheWelcome(tutorialHandler, []);

  // To avoid the unity splash screen [MA]
  useEffect(() => {
    playerService.getUnity().on('progress', (progression: number) => {
      if (progression === 1) {
        dispatch(Creators.loadAvatar.request());
        dispatch(Creators.loadCustomization.request({}));
        dispatch(CreatorLoading.setIsLoading({ isLoading: false }));
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

  useOnPlayingStateChangeHandler(
    (
      isPlaying: boolean,
      isPaused: boolean,
      _isPlayingIntervalAnimation: boolean,
      _isLoading: boolean,
      _isRepeatable: boolean
    ) => {
      if (isPlaying && recording === false) {
        initRecorder();
        recording = true;
      }

      if (wasPlaying.current && !isPlaying) {
        setHasFinished(true);
      }
      if (!isPlaying && recording === true) {
        mediaRecorder.stop();
        recording = false;
      }
      setIsPlaying(isPlaying);
      setIsPaused(isPaused);
      wasPlaying.current = isPlaying;
    },
    [setIsPlaying, setIsPaused, currentAvatar]
  );

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

  useEffect(() => {
    if (hasLoadedAvatarOnce && hasLoadedTutotiralConfigurations) {
      if (currentStep == TutorialSteps.INITIAL) {
        playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_WELCOME);
      }
    }
  }, [hasLoadedAvatarOnce, hasLoadedTutotiralConfigurations]);

  const onSubmittedRevision = useCallback(() => {
    setSubmittedRevision(true);
  }, []);

  useLoadCurrentAvatar(
    currentAvatar,
    PlayerService.getPlayerInstance(),
    currentAvatar,
    () => {
      setHasLoadedAvatarOnce(true);
    }
  );

  useOnCounterGloss((counter: number, _glossLength: number) => {
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
  }, []);

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
      dispatch(Creators.storeAvatar.request('hozana'));
    } else if (currentAvatar === 'hozana') {
      dispatch(Creators.storeAvatar.request('guga'));
    } else {
      dispatch(Creators.storeAvatar.request('icaro'));
    }
  }

  function handleSubtitle() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_SUBTITLE_STATE,
      toInteger(!isShowSubtitle)
    );
    setIsShowSubtitle(!isShowSubtitle);
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
          {currentStep >= TutorialSteps.CLOSE &&
          currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
            <IconRunning color={buttonColors.VARAINT_WHITE} size={32} />
          ) : (
            <button
              className="player-action-button-transparent"
              type="button"
              onClick={() => {
                history.push(paths.DICTIONARY_PLAYER);
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
        {currentStep >= TutorialSteps.CLOSE &&
        currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
          <button
            className="player-action-button player-action-button-insert"
            type="button">
            <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        ) : (
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={() => {
              history.push(paths.TRANSLATOR);
            }}>
            <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        )}

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
            title="Repetir tradução"
            description="Repita a última tradução feita"
            position="bc"
            isEnabled={currentStep === TutorialSteps.REPEAT}
          />
        </div>

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
        {currentStep >= TutorialSteps.CLOSE &&
        currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
          <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
        ) : (
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={() => {
              history.push(paths.HISTORY);
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
    const customizedAvatar = updateAvatarCustomizationProperties({
      avatar: currentAvatar,
      corpo: currentBody,
      cabelo: currentHair,
      camisa: currentShirt,
      calca: currentPants,
      iris: currentEye,
    });
    const preProcessingPreview = JSON.stringify(customizedAvatar);

    playerService.send(
      PlayerKeys.CUSTOMIZATION_BRIDGE,
      PlayerKeys.APPLY_JSON,
      preProcessingPreview
    );
  }, [currentBody, currentHair, currentShirt, currentPants, currentEye]);

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
      <div
        style={{
          position: 'absolute',
          padding: '8px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 2,
        }}></div>
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
        {isPlaying ||
        hasFinished ||
        (currentStep >= TutorialSteps.CLOSE &&
          currentStep <= TutorialSteps.PLAYBACK_SPEED) ? (
          <>
            <div style={{ display: 'flex', flexDirection: 'row' }}>
              <div style={{ marginRight: 6 }}>
                <TutorialPopover
                  title="Fechar"
                  description="Feche tradução e volte à tela anterior"
                  position="rb"
                  isEnabled={currentStep === TutorialSteps.CLOSE}
                />
              </div>
              <button
                disabled={
                  currentStep >= TutorialSteps.CLOSE &&
                  currentStep <= TutorialSteps.PLAYBACK_SPEED
                }
                className="player-button-rounded-top"
                type="button"
                onClick={handleStop}>
                <IconClose color="#FFF" size={24} />
              </button>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: 6, marginTop: 25 }}>
              <TutorialPopover
                title="Trocar avatar"
                description="Alterne entre os avatares disponíveis"
                position="rt"
                isEnabled={currentStep === TutorialSteps.CHANGE_AVATAR}
              />
            </div>
            <div style={{ marginRight: 6 }}>
              <TutorialPopover
                title="Mostrar tutorial"
                description="Reveja as ações disponíveis no player"
                position="rb"
                isEnabled={currentStep === TutorialSteps.TUTORIAL}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <>
                <button
                  disabled={currentStep !== TutorialSteps.IDLE}
                  className="player-button-tutorial-rounded-top"
                  type="button"
                  onClick={goNextStep}>
                  <IconTutorial color="white" />
                </button>
              </>
              <button
                className="player-button-avatar-rounded-top"
                type="button"
                onClick={handleChangeAvatar}>
                {currentAvatar === 'icaro' && <HozanaAvatar />}
                {currentAvatar === 'hozana' && <GugaAvatar />}
                {currentAvatar === 'guga' && <IcaroAvatar />}
              </button>
            </div>
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

      {((currentStep >= TutorialSteps.CLOSE &&
        currentStep <= TutorialSteps.PLAYBACK_SPEED &&
        currentStep !== TutorialSteps.INITIAL) ||
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
              disabled={
                currentStep >= TutorialSteps.CLOSE &&
                currentStep <= TutorialSteps.PLAYBACK_SPEED
              }
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
              currentStep >= TutorialSteps.CLOSE &&
              currentStep <= TutorialSteps.PLAYBACK_SPEED
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
      {TutorialSteps.INITIAL === currentStep && tryShowTutorial && (
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
