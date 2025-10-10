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
import { HomeTutorialSteps, useHomeTutorial } from 'hooks/HomeTutorial';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/customization';
import { Creators as CreatorLoading } from 'store/ducks/loadingAction';
import { Creators as CreatorsVideo } from 'store/ducks/video';
import { Creators as TranslatorCreators } from 'store/ducks/translator';
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
import IconHand from 'assets/icons/IconHand';
import LiveWaveIcon from 'assets/icons/LiveWaveIcon';
import { DictionaryFilter } from 'pages/Dictionary';

const playerService = PlayerService.getPlayerInstance();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

const X0_5 = 0.5;
const X1 = 1;
const X1_5 = 1.5;
const X2 = 2;
const X2_5 = 2.5;

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
  const [isLiveListening, setIsLiveListening] = useState(false);

  // --- Start of Live Translation Refs ---
  const recognitionRef = useRef<any>(null);
  const isLiveActiveRef = useRef<boolean>(false);
  const translationQueueRef = useRef<string[]>([]);
  const speechBufferRef = useRef<string>(''); // Buffer Contínuo
  const lastSentIndexRef = useRef<number>(0); // O Marcador de Progresso
  const chunkingIntervalRef = useRef<NodeJS.Timeout | null>(null); // Para o ciclo de 3s
  const isPlayerBusyRef = useRef<boolean>(false);
  const lastPlayedTextRef = useRef<string>(''); // Trava Anti-Repetição
  // --- End of Live Translation Refs ---

  const history = useHistory();
  history.listen(() => {
    location.pathname !== '/' ? onCancel() : null;
  });

  const {
    currentStep,
    goNextStep,
    onCancel,
    hasLoadedConfigurations: hasLoadedTutotiralConfigurations,
  } = useHomeTutorial();
  const { textGloss, setTextPtBr } = useTranslation();

  const wasPlaying = useRef<boolean>(false);
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

  const initRecorder = async () => {
    const platform = (await info).platform;
    const mimeType = ['android', 'web'].includes(platform)
      ? 'video/webm'
      : 'video/mp4';

    const canvas = document.querySelector('canvas');
    const stream = canvas?.captureStream(60);
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
      setIsInBackground(!isActive);
    };
    App.addListener('appStateChange', handleAppStateChange);
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
        dispatch(CreatorLoading.setIsLoading({ isLoading: false }));
        setVisiblePlayer(true);
      }
    });
  }, [dispatch]);

  // Adicionando de volta o "porteiro" que inicia o modo ao vivo
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('live') === '1') {
      // Remove o parâmetro da URL para não reativar ao recarregar
      history.replace(paths.HOME);
      startLiveRecognition();
    }
  }, [location.search, history]); // Adicionei history como dependência

  useEffect(() => {
    if (visiblePlayer) {
      dispatch(Creators.loadCustomization.request(currentAvatar));
    }
  }, [currentAvatar, visiblePlayer, dispatch]);

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
    const savedState = sessionStorage.getItem('dictionaryState');
    if(savedState) {
      const parsed = JSON.parse(savedState);
      const params = new URLSearchParams();
      if(parsed.filter) {
        params.set('filter', parsed.filter);
        if(parsed.category) {
          params.set('category', parsed.category);
        }
        if(parsed.scrollTop) {
          params.set('scroll', parsed.scrollTop);
        }
        history.push(`${paths.DICTIONARY_PLAYER}?${params.toString()}`);
      } else {

        history.replace(paths.HOME);
      }
    }
    sessionStorage.removeItem('dictionaryState');
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
    setHasFinished(false);
  }

  const [showModal, setShowModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showSuggestionFeedbackModal, setShowSuggestionFeedbackModal] =
    useState(false);
  const [submittedRevision, setSubmittedRevision] = useState(false);

  // --- Start of Live Translation Logic ---

  // O Gerente da Fila, agora usando o Semáforo
  const processTranslationQueue = useCallback(
    async () => {
      // 1. Verifica o semáforo e a fila.
      if (isPlayerBusyRef.current || translationQueueRef.current.length === 0) {
        return;
      }

      // 2. Imediatamente fecha o semáforo para vermelho.
      isPlayerBusyRef.current = true;

      // 3. Envia o próximo item para tradução.
      const textToPlay = translationQueueRef.current.shift();

      // Trava Anti-Repetição: Não executa se o texto for nulo ou igual ao último.
      if (!textToPlay || textToPlay === lastPlayedTextRef.current) {
        // Se ignorarmos, temos que garantir que o próximo item seja processado.
        isPlayerBusyRef.current = false;
        processTranslationQueue(); // Tenta o próximo da fila.
        return;
      }

      isPlayerBusyRef.current = true;
      lastPlayedTextRef.current = textToPlay; // Armazena o texto que será executado.
      if (textToPlay) {
        const gloss = (await setTextPtBr(textToPlay, false, false)).toString();

        playerService.send(
          PlayerKeys.PLAYER_MANAGER,
          PlayerKeys.PLAY_NOW,
          gloss
        );
      } else {
        // Se por acaso o item for inválido, abre o semáforo novamente.
        isPlayerBusyRef.current = false;
      }
    },
    [setTextPtBr]
  ); // Não depende mais de 'isPlaying', é uma função estável.

  // Hook que ouve o avatar e controla o semáforo
  useOnPlayingStateChangeHandler(
    (
      newIsPlaying: boolean,
      isPaused: boolean,
      _isPlayingIntervalAnimation: boolean,
      _isLoading: boolean,
      _isRepeatable: boolean
    ) => {
      // Atualiza o estado visual do player
      setIsPlaying(newIsPlaying);
      setIsPaused(isPaused);

      isPlayerBusyRef.current = newIsPlaying; // O estado do semáforo espelha o do player

      if (wasPlaying.current && !newIsPlaying) {
        setHasFinished(true);
        // O Avatar terminou! Abre o semáforo e chama o gerente.
        isPlayerBusyRef.current = false;
        // Adiciona um "respiro" de 100ms para o Avatar antes de processar o próximo.
        setTimeout(() => {
          processTranslationQueue();
        }, 100);
      }

      wasPlaying.current = newIsPlaying;

      // Código de gravação de vídeo (não relacionado à fila)
      if (newIsPlaying && recording === false) {
        initRecorder();
        recording = true;
      }
      if (!newIsPlaying && recording === true) {
        mediaRecorder.stop();
        recording = false;
      }
    },
    [processTranslationQueue]
  );

  function startLiveRecognition() {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Reconhecimento de voz não suportado neste navegador.');
      return;
    }

    if (recognitionRef.current) {
      return;
    }

    isLiveActiveRef.current = true;
    translationQueueRef.current = [];
    speechBufferRef.current = ''; // Zera o buffer
    lastSentIndexRef.current = 0; // Zera o marcador
    isPlayerBusyRef.current = false;
    lastPlayedTextRef.current = '';
    setIsLiveListening(true);

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    // A única tarefa do onresult é atualizar o buffer com a fala completa.
    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript;
      }
      console.log('[MODO LIVE] Texto bruto capturado:', currentTranscript);
      speechBufferRef.current = currentTranscript;
    };

    recognition.onend = () => {
      if (isLiveActiveRef.current) {
        // Adiciona um pequeno delay para evitar reinicializações muito rápidas
        // que podem ser bloqueadas pelo navegador ou causar um loop de erros.
        setTimeout(() => {
          // Garante que a referência ainda existe caso o usuário tenha parado manualmente.
          if (isLiveActiveRef.current && recognitionRef.current) {
            recognitionRef.current.start();
          }
        }, 250);
      }
    };

    recognition.onerror = (event: any) => {
      // O erro 'no-speech' é comum e esperado quando o usuário faz uma pausa.
      // Apenas o ignoramos e deixamos o 'onend' reiniciar o reconhecimento.
      if (event.error === 'no-speech') {
        return;
      }
      // Para outros erros, logamos e paramos.
      console.error('Erro no reconhecimento de voz:', event.error);
      stopLiveRecognition();
    };

    // Limpa qualquer ciclo anterior e inicia o novo.
    if (chunkingIntervalRef.current) {
      clearInterval(chunkingIntervalRef.current);
    }
    chunkingIntervalRef.current = setInterval(() => {
      if (!isLiveActiveRef.current) return;

      const fullText = speechBufferRef.current;
      const lastIndex = lastSentIndexRef.current;

      // Se houver texto novo DEPOIS do marcador...
      if (fullText.length > lastIndex) {
        // ...pega apenas o trecho novo.
        const newChunk = fullText.substring(lastIndex).trim();
        if (newChunk) {
          console.log('[MODO LIVE] Enviando para tradução:', newChunk);
          translationQueueRef.current.push(newChunk);
          // E avança o marcador para a posição atual.
          lastSentIndexRef.current = fullText.length;
          processTranslationQueue();
        }
      }
    }, 1500);

    recognition.start();
  }

  function stopLiveRecognition() {
    isLiveActiveRef.current = false;
    if (recognitionRef.current) {
      recognitionRef.current.onend = null;
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }

    if (chunkingIntervalRef.current) {
      clearInterval(chunkingIntervalRef.current);
    }

    translationQueueRef.current = [];
    speechBufferRef.current = '';
    lastSentIndexRef.current = 0; // Reseta o marcador
    isPlayerBusyRef.current = false;
    lastPlayedTextRef.current = '';
    setIsLiveListening(false);
    handleStop();
  }
  // --- End of Live Translation Logic ---

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
      if (currentStep == HomeTutorialSteps.INITIAL) {
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

  function handleTranslateLive(text: string) {
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  const renderPlayerButtons = () => {
    // Se estiver no modo live, o botão central para a gravação
    if (isLiveListening) {
      return (
        <>
          <div /> {/* Placeholder para manter o espaçamento */}
          <button
            className="player-button-center-live"
            onClick={stopLiveRecognition}>
            <LiveWaveIcon />
          </button>
          <div /> {/* Placeholder para manter o espaçamento */}
        </>
      );
    }

    // Lógica padrão dos botões
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
          {currentStep === HomeTutorialSteps.DICTIONARY && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-10%',
                left: '7%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '60px',
                height: '45px',
                borderRadius: '5px',
                border: '2px solid #3885F9',
                boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          {currentStep === HomeTutorialSteps.PLAYBACK_SPEED && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-5%',
                left: '-40%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '60px',
                height: '45px',
                borderRadius: '5px',
                border: '2px solid #3885F9',
                boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          {currentStep === HomeTutorialSteps.TRANSLATION && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-12%',
                left: '184%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0px 0px 18px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          {currentStep === HomeTutorialSteps.REPEAT && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-17%',
                left: '285%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                border: '2px solid white',
                boxShadow: '0px 0px 18px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          {currentStep >= HomeTutorialSteps.CLOSE &&
          currentStep <= HomeTutorialSteps.PLAYBACK_SPEED ? (
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

          {currentStep === HomeTutorialSteps.HISTORY && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-5%',
                left: '347%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '60px',
                height: '45px',
                borderRadius: '5px',
                border: '2px solid #3885F9',
                boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          {currentStep === HomeTutorialSteps.SUBTITLE && (
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: '-7%',
                left: '587%',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '56px',
                height: '45px',
                borderRadius: '5px',
                border: '2px solid #3885F9',
                boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 80,
              left: 25,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Dicionário"
              context="home"
              description="Consulte os sinais de LIBRAS disponíveis no nosso dicionário."
              position="bl"
              isEnabled={currentStep === HomeTutorialSteps.DICTIONARY}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 80,
              left: 25,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Tradução PT-BR"
              context="home"
              description="Escreva ou cole textos e traduza-os para a Língua Brasileira de Sinais (LIBRAS)."
              position="bc"
              isEnabled={currentStep === HomeTutorialSteps.TRANSLATION}
            />
          </div>
        </div>
        {currentStep >= HomeTutorialSteps.CLOSE &&
        currentStep <= HomeTutorialSteps.PLAYBACK_SPEED ? (
          <button
            className="player-action-button player-action-button-insert"
            id="refresh-button"
            type="button">
            <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        ) : (
          <button
            className="player-action-button player-action-button-insert"
            id="translation-button"
            type="button"
            onClick={() => {
              dispatch(TranslatorCreators.setTranslatorText(''));
              history.push(paths.TRANSLATOR);
            }}>
            <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        )}

        <div
          style={{
            margin: 'auto',
            position: 'absolute',
            bottom: 85,
            left: 20,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
          }}>
          <TutorialPopover
            title="Repetir tradução"
            context="home"
            description="Repita a última tradução feita"
            position="bc"
            isEnabled={currentStep === HomeTutorialSteps.REPEAT}
          />
        </div>

        <div
          style={{
            margin: 'auto',
            position: 'absolute',
            bottom: 80,
            left: 25,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
          }}>
          <TutorialPopover
            title="Histórico"
            context="home"
            description="Acesse as traduções que foram realizadas nos últimos 30 dias."
            position="br"
            isEnabled={currentStep === HomeTutorialSteps.HISTORY}
          />
        </div>

        {currentStep >= HomeTutorialSteps.CLOSE &&
        currentStep <= HomeTutorialSteps.PLAYBACK_SPEED ? (
          <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
        ) : (
          <button
            className="player-action-button-transparent"
            id="history-button"
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
              bottom: 85,
              left: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Legenda"
              context="home"
              description="Habilite legenda para tradução"
              position="br"
              isEnabled={currentStep === HomeTutorialSteps.SUBTITLE}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 85,
              left: 20,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Velocidade de reprodução"
              context="home"
              description="Altere a velocidade de reprodução"
              position="bl"
              isEnabled={currentStep === HomeTutorialSteps.PLAYBACK_SPEED}
            />
          </div>
        </div>
      </>
    );
  };

  const renderPlayerButtonsContainer = () => {
    // Durante o modo live, não renderiza nenhum botão no canto superior
    if (isLiveListening) {
      return null;
    }

    if (
      isPlaying ||
      hasFinished ||
      (currentStep >= HomeTutorialSteps.CLOSE &&
        currentStep <= HomeTutorialSteps.PLAYBACK_SPEED)
    ) {
      return (
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div
            style={{
              position: 'absolute',
              padding: '8px',
              display: 'flex',
              right: 10,
              top: 0,
              flexDirection: 'column',
              alignItems: 'flex-start',
              zIndex: 2,
            }}>
            <TutorialPopover
              title="Fechar"
              context="home"
              description="Feche tradução e volte à tela anterior."
              position="rt"
              isEnabled={currentStep === HomeTutorialSteps.CLOSE}
            />
          </div>

          <div>
            {currentStep === HomeTutorialSteps.CLOSE && (
              <div
                className="highligth"
                style={{
                  position: 'absolute',
                  display: 'flex',
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1px solid white',
                  boxShadow: '0px 0px 18px rgba(86, 154, 255, 0.75)',
                  zIndex: 1,
                }}></div>
            )}
            <button
              style={{ marginBottom: 0 }}
              disabled={
                currentStep >= HomeTutorialSteps.CLOSE &&
                currentStep <= HomeTutorialSteps.PLAYBACK_SPEED
              }
              className="player-button-rounded"
              type="button"
              onClick={handleStop}>
              <IconClose color="#FFF" size={24} />
            </button>
          </div>
        </div>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div
          style={{
            position: 'absolute',
            padding: '8px',
            right: 15,
            top: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            zIndex: 2,
          }}>
          <TutorialPopover
            title="Trocar avatar"
            context="home"
            description="Escolha qual avatar interpretará os sinais em LIBRAS."
            position="rc"
            isEnabled={currentStep === HomeTutorialSteps.CHANGE_AVATAR}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            padding: '8px',
            right: 15,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            zIndex: 2,
          }}>
          <TutorialPopover
            title="Central de ajuda"
            context="home"
            description="Clique para abrir novamente o tour guiado. Tenha uma ótima experiência VLibras!"
            position="rt"
            isEnabled={currentStep === HomeTutorialSteps.TUTORIAL}
          />
        </div>
        {currentStep === HomeTutorialSteps.CHANGE_AVATAR && (
          <div
            style={{
              position: 'absolute',
              display: 'flex',
              bottom: '16px',
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1px solid white',
              boxShadow: '0px 0px 18px rgba(86, 154, 255, 0.75)',
            }}></div>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: 'fit-content',
          }}>
          {currentStep === HomeTutorialSteps.TUTORIAL && (
            <div
              style={{
                marginTop: 'auto',
                position: 'absolute',
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: '1px solid white',
                boxShadow: '0px 0px 18px rgba(86, 154, 255, 0.75)',
              }}></div>
          )}
          <>
            <button
              disabled={currentStep !== HomeTutorialSteps.IDLE}
              className="player-button-tutorial-rounded-top"
              type="button"
              onClick={goNextStep}>
              <IconTutorial color="black" size={44} />
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
          right: 10,
          flexDirection: 'column',
          alignItems: 'flex-start',
          zIndex: 2,
        }}>
        <TutorialPopover
          title="Menu"
          context="home"
          description="Acesse outras funcionalidades do tradutor e configure sua experiência no VLibras."
          position="tl"
          isEnabled={currentStep === HomeTutorialSteps.MENU}
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
              speedValue === X2_5
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X2_5)}>
            <span>2.5x</span>
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
            <span>2x</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X1_5
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X1_5)}>
            <span>1.5x</span>
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
            <span>1x</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X0_5
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X0_5)}>
            <span>0.5x</span>
          </button>
        </div>
      </IonPopover>
      <div className="player-container-button">
        {renderPlayerButtonsContainer()}
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

      {((currentStep >= HomeTutorialSteps.CLOSE &&
        currentStep <= HomeTutorialSteps.PLAYBACK_SPEED &&
        currentStep !== HomeTutorialSteps.INITIAL) ||
        (hasFinished && !isPlaying)) && (
        <div className="player-container-buttons">
          <div
            style={{
              top: -54,
              position: 'absolute',
              right: 25,
            }}>
            <TutorialPopover
              title="Gostou da tradução?"
              context="home"
              description="Avalie e sugira melhorias."
              position="rb"
              isEnabled={currentStep === HomeTutorialSteps.LIKED_TRANSLATION}
            />
          </div>
          {!submittedRevision && (
            <button
              disabled={
                currentStep >= HomeTutorialSteps.CLOSE &&
                currentStep <= HomeTutorialSteps.PLAYBACK_SPEED
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
              right: 25,
            }}>
            <TutorialPopover
              title="Compartilhar"
              context="home"
              description="Vídeo com a tradução"
              position="rb"
              isEnabled={currentStep === HomeTutorialSteps.SHARE}
            />
          </div>
          <button
            style={{ marginBottom: 0 }}
            disabled={
              currentStep >= HomeTutorialSteps.CLOSE &&
              currentStep <= HomeTutorialSteps.PLAYBACK_SPEED
            }
            className="player-button-rounded"
            type="button"
            onClick={() => {
              // // Parando A GRAVAÇÃO E COMPARTILHANDO O ARQUIVO GRAVADO
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
      {HomeTutorialSteps.INITIAL === currentStep && tryShowTutorial && (
        <div className="tutorial-box-shadow">
          <div className="upper-side">
            <IconHand />
            <h1>Seja bem-vindo ao VLibras</h1>
            <h2>
              Quer saber mais sobre os recursos do nosso aplicativo para
              dispositivos móveis?
            </h2>
          </div>
          <hr />
          <div className="lower-side">
            <button className="button-solid" onClick={goNextStep}>
              Iniciar tour guiado
            </button>
            <button className="button-outlined" onClick={onCancel}>
              Pular
            </button>
          </div>
        </div>
      )}
      {isLiveListening && (
        <button
          onClick={stopLiveRecognition}
          style={{position: 'fixed', top: 60, right: 20, zIndex: 10000,
                  background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none',
                  borderRadius: '50%', width: 40, height: 40, fontSize: 24, cursor: 'pointer'}}
          aria-label="Fechar modo live"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default Player;
