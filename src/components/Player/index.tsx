/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable quotes */
/* eslint-disable import/order */
/* eslint-disable react/button-has-type */
import { IonPopover, isPlatform } from '@ionic/react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Unity from 'react-unity-webgl';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import { App, StateChangeListener } from '@capacitor/app';

import {
  IconDictionary,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconRunning,
  IconPause,
  IconPlay,
  IconShare,
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
  IconHandsTranslate,
  IconThumbUp,
} from 'assets';
import IconEmotions from 'assets/icons/IconEmotions';
import { BottomTabBar } from 'components';
import EvaluationModal from 'components/EvaluationModal';
import TutorialPopover from 'components/TutorialPopover';
import { EMOTION_OPTIONS, EmotionOption } from 'constants/emotions';
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
import { reloadHistory } from 'utils/setHistory';
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
import { MINI_PLAYER_SHARE_EVENT } from 'pages/Dictionary/MiniPlayer';

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

function formatSpeedLabel(speed: number): string {
  const value = Number.isInteger(speed) ? speed.toFixed(0) : String(speed);
  return `${value}x`;
}

let recording = false;
let isLoading = false;
let contador = 60;
let isBreak = false;

let mediaRecorder: MediaRecorder;
let recordedChunks: BlobPart[] | undefined;
const info = Device.getInfo();

// Steps that require the avatar to be in playing/finished state during the tutorial.
// These enum values don't form a contiguous numeric range after queue reordering,
// so we use a Set for reliable membership checks.
const TUTORIAL_PLAYING_STEPS = new Set([
  HomeTutorialSteps.CLOSE,
  HomeTutorialSteps.LIKED_TRANSLATION,
  HomeTutorialSteps.SHARE,
  HomeTutorialSteps.SUBTITLE,
  HomeTutorialSteps.REPEAT,
  HomeTutorialSteps.CHANGE_AVATAR,
  HomeTutorialSteps.PLAYBACK_SPEED,
]);

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
  const [emotionPopoverState, setEmotionPopoverState] = useState<{
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
  const finalTranscriptRef = useRef<string>('');
  const isLiveActiveRef = useRef<boolean>(false);
  const translationQueueRef = useRef<string[]>([]);
  const speechBufferRef = useRef<string>(''); // Buffer Contínuo
  const lastSentIndexRef = useRef<number>(0); // O Marcador de Progresso
  const chunkingIntervalRef = useRef<NodeJS.Timeout | null>(null); // Para o ciclo de 3s
  const isPlayerBusyRef = useRef<boolean>(false);
  const lastPlayedTextRef = useRef<string>(''); // Trava Anti-Repetição
  const playbackProgressRef = useRef<{
    counter: number;
    glossLength: number;
    lastUpdateAt: number;
  }>({ counter: 0, glossLength: 0, lastUpdateAt: 0 });
  // --- End of Live Translation Refs ---

  const history = useHistory();

  const {
    currentStep,
    goNextStep,
    onCancel,
    hasLoadedConfigurations: hasLoadedTutotiralConfigurations,
  } = useHomeTutorial();
  const { textGloss, setTextPtBr, sentimentAnalysis, selectedEmotion, setSelectedEmotion } =
    useTranslation();

  const wasPlaying = useRef<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const [emotionMap, setEmotionMap] = useState<
    { emotion: PlayerKeys; startIndex: number; endIndex: number }[]
  >([]);
  const lastPlayedEmotionIndex = useRef(-1);

  const location = useLocation();
  const dispatch = useDispatch();

  // Avoid leaking listeners: history.listen must be registered once with cleanup.
  // Also cancel the tutorial when navigating away from HOME.
  useEffect(() => {
    const unlisten = history.listen((nextLocation: any) => {
      if (nextLocation?.pathname !== paths.HOME) {
        onCancel();
      }
    });
    return () => {
      if (typeof unlisten === 'function') unlisten();
    };
  }, [history, onCancel]);

  // If another route navigated back to HOME with a pending gloss to play,
  // only trigger playback after Unity has finished loading (visiblePlayer).
  const consumedPlayRef = useRef<{ gloss: string; at?: number } | null>(null);
  const pendingAutoPlayRef = useRef<{
    gloss: string;
    at?: number;
    timeoutId: number;
  } | null>(null);
  useEffect(() => {
    if (location.pathname !== paths.HOME) return;
    if (!visiblePlayer) return;

    const state = location.state as any;
    const playGloss = state?.playGloss;
    if (!playGloss) return;
    const playAt = state?.playAt as number | undefined;

    const glossStr = String(playGloss);
    if (
      consumedPlayRef.current &&
      consumedPlayRef.current.gloss === glossStr &&
      consumedPlayRef.current.at === playAt
    ) {
      return;
    }

    // COMENTADO PARA DEPLOY - Lógica de modo automático removida temporariamente
    // In automatic emotion mode, give a small window for sentiment/emotionMap to arrive,
    // so short phrases can still change expression.
    // if (selectedEmotion === 'Automático' && emotionMap.length === 0) {
    //   // If we already scheduled a timeout for this exact play, don't schedule again.
    //   if (
    //     pendingAutoPlayRef.current &&
    //     pendingAutoPlayRef.current.gloss === glossStr &&
    //     pendingAutoPlayRef.current.at === playAt
    //   ) {
    //     return;
    //   }
    //   const timeoutId = window.setTimeout(() => {
    //     consumedPlayRef.current = { gloss: glossStr, at: playAt };
    //     handlePlay(glossStr);
    //     pendingAutoPlayRef.current = null;
    //   }, 700);
    //   pendingAutoPlayRef.current = { gloss: glossStr, at: playAt, timeoutId };
    //   return;
    // }

    // If we had a pending autoplay and emotionMap is ready, play immediately and clear timeout.
    if (pendingAutoPlayRef.current) {
      window.clearTimeout(pendingAutoPlayRef.current.timeoutId);
      pendingAutoPlayRef.current = null;
    }
    consumedPlayRef.current = { gloss: glossStr, at: playAt };
    handlePlay(glossStr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.state, visiblePlayer, selectedEmotion, emotionMap.length]);

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
    let handled = false;
    const unity: any = playerService.getUnity();

    const onUnityReady = () => {
      if (handled) return;
      handled = true;
      dispatch(Creators.loadAvatar.request());
      dispatch(CreatorLoading.setIsLoading({ isLoading: false }));
      setVisiblePlayer(true);
    };

    // If Unity is already ready (e.g., navigating back from Translator), the progress
    // event may not fire again. In that case, mark it visible immediately.
    if ((playerService as any).getIsReady?.()) {
      onUnityReady();
      return;
    }

    const onProgress = (progression: number) => {
      if (progression === 1) onUnityReady();
    };

    unity?.on?.('progress', onProgress);
    return () => {
      unity?.removeListener?.('progress', onProgress);
      unity?.off?.('progress', onProgress);
    };
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

  useEffect(() => {
    const sentiments = Array.isArray(sentimentAnalysis) ? sentimentAnalysis : [];
    // COMENTADO PARA DEPLOY - Lógica de modo automático removida temporariamente
    // if (selectedEmotion !== 'Automático' || sentiments.length === 0) {
      setEmotionMap([]);
      return;
    // }

    const sentimentsMap: Record<string, PlayerKeys> = {
      Feliz: PlayerKeys.APPLY_HAPPY_EMOTION,
      Tristeza: PlayerKeys.APPLY_SAD_EMOTION,
      Neutro: PlayerKeys.APPLY_DEFAULT_EMOTION,
      Medo: PlayerKeys.APPLY_FEAR_EMOTION,
      Surpresa: PlayerKeys.APPLY_SURPRISE_EMOTION,
      Raiva: PlayerKeys.APPLY_ANGRY_EMOTION,
    };

    let wordCounter = 0;
    const newEmotionMap = sentiments
      .map((sentence) => {
        const translationText =
          typeof (sentence as any)?.traducao === 'string'
            ? ((sentence as any).traducao as string)
            : '';
        const wordCount = translationText
          ? translationText.split(' ').filter(Boolean).length
          : 0;
        if (wordCount <= 0) return null;

        const sentimentKey = String((sentence as any)?.sentimento ?? '').trim();
        const emotion = sentimentsMap[sentimentKey] ?? PlayerKeys.APPLY_DEFAULT_EMOTION;
        const emotionData = {
          emotion,
          startIndex: wordCounter,
          endIndex: wordCounter + wordCount - 1,
        };
        wordCounter += wordCount;
        return emotionData;
      })
      .filter(Boolean) as { emotion: PlayerKeys; startIndex: number; endIndex: number }[];

    setEmotionMap(newEmotionMap);
  }, [sentimentAnalysis, selectedEmotion]);

  function handlePlay(gloss: string) {
    if (progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
    }
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
  }
  const translatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText
  );

  const [showTranslateError, setShowTranslateError] = useState(false);

  async function translateText() {
    const formatted = translatorText.trim();

    if (formatted === '') {
      setShowTranslateError(true);
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    await reloadHistory(today, formatted, 'text');

    if (formatted.toLocaleLowerCase() === 'ativar modo live') {
      startLiveRecognition();
      return;
    }

    const gloss = (await setTextPtBr(formatted, false)).toString();
    handlePlay(gloss);
    dispatch(TranslatorCreators.setTranslatorText(formatted));
  }

  function handleStop() {
    /*
     * NOTE: previously this also redirected the user to the Dictionary
     * whenever a `dictionaryState` entry was present in sessionStorage.
     * That entry, however, sticks around for the whole session, so the
     * Translator's close button could end up navigating to the Dictionary
     * when the user had simply visited it earlier. The dictionary route is
     * now reachable through the persistent BottomTabBar, so closing the
     * player should only stop playback and trigger the existing
     * tutorial/exit popups – the original behaviour the user relies on.
     */
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
        // Garante que o avatar volte ao idle (evita ficar "travado" no último sinal).
        setTimeout(() => {
          playerService.send(
            PlayerKeys.PLAYER_MANAGER,
            PlayerKeys.INIT_RANDOM_ANIMATION
          );
        }, 120);
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

  useEffect(() => {
    // Watchdog: se o CounterGloss chegou ao fim e não há avanço/encerramento,
    // força reset para evitar travar no último sinal.
    if (!isPlaying || isPaused) return;
    const id = window.setInterval(() => {
      if (!isPlaying || isPaused) return;
      const { counter, glossLength, lastUpdateAt } = playbackProgressRef.current;
      if (!glossLength || !counter) return;
      // Só atua quando já chegamos ao fim.
      if (counter < glossLength) return;
      const now = Date.now();
      if (now - lastUpdateAt < 1200) return;

      playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
      playerService.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.INIT_RANDOM_ANIMATION
      );
      setIsPlaying(false);
      setIsPaused(false);
      setHasFinished(true);
      isPlayerBusyRef.current = false;
    }, 800);
    return () => window.clearInterval(id);
  }, [isPlaying, isPaused]);

  function startLiveRecognition() {
    // Reseta o estado para uma nova sessão de tradução.
    finalTranscriptRef.current = '';
    speechBufferRef.current = '';
    lastSentIndexRef.current = 0;
    translationQueueRef.current = [];
    isPlayerBusyRef.current = false;
    lastPlayedTextRef.current = '';
    isLiveActiveRef.current = true;
    setIsLiveListening(true);

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

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    // A única tarefa do onresult é atualizar o buffer com a fala completa.
    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const result = event.results[i];
        if (result[0].confidence > 0.1) {
          if (result.isFinal) {
            finalTranscriptRef.current += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }
      }

      speechBufferRef.current = finalTranscriptRef.current + interimTranscript;

      console.log('[MODO LIVE] Final:', finalTranscriptRef.current);
      console.log('[MODO LIVE] Interino:', interimTranscript);
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
    }, 750);

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
      chunkingIntervalRef.current = null;
    }
    finalTranscriptRef.current = '';
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

  // When the tutorial advances to a step that requires playing state,
  // auto-play a demo gloss so the controls overlay becomes visible.
  useEffect(() => {
    if (!TUTORIAL_PLAYING_STEPS.has(currentStep)) return;
    if (isPlaying || hasFinished) return;
    if (!visiblePlayer) return;
    const demoGloss = textGloss || 'BOM DIA';
    handlePlay(demoGloss);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

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

  useOnCounterGloss((counter: number, glossLength: number) => {
    playbackProgressRef.current = {
      counter,
      glossLength,
      lastUpdateAt: Date.now(),
    };
    // COMENTADO PARA DEPLOY - Lógica de emoção automática removida temporariamente
    // if (selectedEmotion === 'Automático' && emotionMap.length > 0) {
    //   const currentWordIndex = counter - 1;

    //   const currentEmotionData = emotionMap.findIndex(
    //     (e) =>
    //       currentWordIndex >= e.startIndex && currentWordIndex <= e.endIndex,
    //   );

    //   if (
    //     currentEmotionData !== -1 &&
    //     lastPlayedEmotionIndex.current !== currentEmotionData
    //   ) {
    //     PlayerService.getPlayerInstance().send(
    //       PlayerKeys.EMOTION_BRIDGE,
    //       emotionMap[currentEmotionData].emotion,
    //     );
    //     lastPlayedEmotionIndex.current = currentEmotionData;
    //   }
    // }

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
  }, [selectedEmotion, emotionMap]);

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

  function handleEmotion(option: EmotionOption) {
    setSelectedEmotion(option.id);
    playerService.send(PlayerKeys.EMOTION_BRIDGE, option.applyKey);
    setEmotionPopoverState({ showPopover: false, event: undefined });
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

  const renderPlaybackControls = () => (
    <>
      {/* Replay / Pause — tutorial: Repetir tradução */}
      <div style={{ position: 'relative' }}>
        <TutorialPopover
          title="Repetir tradução"
          context="home"
          description="Reproduza novamente a tradução atual."
          position="bl"
          floatingStyle={{ left: -10, transform: 'none' }}
          isEnabled={currentStep === HomeTutorialSteps.REPEAT}
        />
        <button
          className="player-ctrl-pause-btn"
          type="button"
          onClick={isPlaying ? handlePause : () => handlePlay(textGloss)}>
          {isPlaying ? (
            isPaused ? (
              <IconPlay hideCircle color="#FFF" size={26} />
            ) : (
              <IconPause color="#FFF" size={26} />
            )
          ) : (
            <img src={logoRefresh} alt="Reproduzir novamente" className="player-ctrl-refresh-icon" />
          )}
        </button>
      </div>

      {/* Speed — tutorial: Velocidade de reprodução */}
      <button
        className="player-ctrl-speed-btn"
        type="button"
        onClick={(e: any) => {
          e.persist();
          setShowPopover({ showPopover: true, event: e });
        }}>
        <div style={{ position: 'relative' }}>
          <TutorialPopover
            title="Velocidade de reprodução"
            context="home"
            description="Altere a velocidade de reprodução"
            position="bc"
            floatingStyle={{
              left: -82,
              transform: 'none',
              bottom: 'calc(100% + 18px)',
            }}
            arrowStyle={{ left: '28%' }}
            onPrimaryAction={() => {
              if (currentStep === HomeTutorialSteps.PLAYBACK_SPEED) {
                handleStop();
              }
              goNextStep();
            }}
            isEnabled={currentStep === HomeTutorialSteps.PLAYBACK_SPEED}
          />
          <span className="player-ctrl-speed-label">{formatSpeedLabel(speedValue)}</span>
        </div>
      </button>

      {/* Emotion — tutorial: Emoção do avatar */}
      <div style={{ position: 'relative' }}>
        <TutorialPopover
          title="Emoção do avatar"
          context="home"
          description="Altere a emoção do avatar."
          position="bc"
          isEnabled={currentStep === HomeTutorialSteps.CHANGE_AVATAR}
        />
        <button
          className="player-ctrl-btn"
          type="button"
          disabled={
            TUTORIAL_PLAYING_STEPS.has(currentStep) &&
            currentStep !== HomeTutorialSteps.CHANGE_AVATAR
          }
          onClick={(e: any) => {
            e.persist();
            setEmotionPopoverState({ showPopover: true, event: e });
          }}
          title="Emoções">
          <IconEmotions color="#1447a6" size={22} />
        </button>
      </div>

      {/* Subtitle — tutorial: Legenda */}
      <div style={{ position: 'relative' }}>
        <TutorialPopover
          title="Legenda"
          context="home"
          description="Ative ou desative a legenda durante a tradução."
          position="br"
          floatingStyle={{
            right: -16,
            left: 'auto',
            transform: 'none',
            width: '300px',
            maxWidth: 'calc(100vw - 18px)',
          }}
          arrowStyle={{ right: '34px' }}
          isEnabled={currentStep === HomeTutorialSteps.SUBTITLE}
        />
        <button
          className="player-ctrl-btn"
          type="button"
          onClick={handleSubtitle}>
          {isShowSubtitle ? (
            <img src={logoSubtitleOn} alt="Legenda ativada" />
          ) : (
            <img src={logoSubtitleOff} alt="Legenda desativada" />
          )}
        </button>
      </div>

      {/* Share — tutorial: Compartilhar */}
      <div style={{ position: 'relative' }}>
        <TutorialPopover
          title="Compartilhar"
          context="home"
          description="Vídeo com a tradução"
          position="br"
          floatingStyle={{ right: -10, left: 'auto', transform: 'none' }}
          isEnabled={currentStep === HomeTutorialSteps.SHARE}
        />
        <button
          className="player-ctrl-btn"
          type="button"
          disabled={TUTORIAL_PLAYING_STEPS.has(currentStep)}
          onClick={() => {
            if (!recording) {
              initVideoSharing();
              handleClick();
            }
          }}>
          <IconShare color="#1447a6" size={22} />
        </button>
      </div>
    </>
  );

  const renderTabBar = () => (
    <BottomTabBar
      active="translator"
      renderTabExtras={(tab) => {
        if (tab === 'dictionary') {
          return (
            <TutorialPopover
              title="Dicionário"
              context="home"
              description="Consulte os sinais de LIBRAS disponíveis no nosso dicionário."
              position="bl"
              floatingStyle={{ left: 26, transform: 'none' }}
              isEnabled={currentStep === HomeTutorialSteps.DICTIONARY}
            />
          );
        }
        if (tab === 'translator') {
          return (
            <TutorialPopover
              title="Tradução PT-BR"
              context="home"
              description="Escreva ou cole textos e traduza-os para a Língua Brasileira de Sinais (LIBRAS)."
              position="bc"
              isEnabled={currentStep === HomeTutorialSteps.TRANSLATION}
            />
          );
        }
        return (
          <TutorialPopover
            title="Histórico"
            context="home"
            description="Acesse as traduções que foram realizadas nos últimos 30 dias."
            position="br"
            floatingStyle={{ right: 24, left: 'auto', transform: 'none' }}
            isEnabled={currentStep === HomeTutorialSteps.HISTORY}
          />
        );
      }}
    />
  );

  const renderPlayerButtons = () => {
    /* Modo live: precisa do wrapper `.play-action-content` (layout em linha
     * com placeholders nas laterais). Os outros estados renderizam a
     * `BottomTabBar` direto, para que ela controle sua própria altura e não
     * receba o padding adicional do wrapper. */
    if (isLiveListening) {
      return (
        <div className="play-action-content">
          <div /> {/* Placeholder para manter o espaçamento */}
          <button
            className="player-button-center-live"
            onClick={stopLiveRecognition}>
            <LiveWaveIcon />
          </button>
          <div /> {/* Placeholder para manter o espaçamento */}
        </div>
      );
    }

    if (isPlaying || hasFinished) {
      return (
        <div className="player-playing-panel">
          <div className="player-controls-bar">
            {renderPlaybackControls()}
          </div>
          {renderTabBar()}
        </div>
      );
    }

    return renderTabBar();
  };

  const renderPlayerButtonsContainer = () => {
    // Durante o modo live, não renderiza nenhum botão no canto superior
    if (isLiveListening) {
      return null;
    }

    // Quando traduzindo, os botões (fechar, thumbs up) estão na overlay - não duplicar
    if (isPlaying || hasFinished) {
      return null;
    }

    if (
      currentStep >= HomeTutorialSteps.CLOSE &&
      currentStep <= HomeTutorialSteps.PLAYBACK_SPEED
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
    // Botões de tutorial e troca de avatar removidos da UI (lógica preservada).
    // Serão reimplementados em outro lugar.
    return null;
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

  // The dictionary mini player relays its share button via this event because
  // the recorder + share state lives here in the Home Player. We handle it
  // exactly the same way as a tap on the Player's own share button.
  useEffect(() => {
    const onMiniPlayerShare = () => {
      if (recording) return;
      initVideoSharing();
      handleClick();
    };
    window.addEventListener(MINI_PLAYER_SHARE_EVENT, onMiniPlayerShare);
    return () => {
      window.removeEventListener(MINI_PLAYER_SHARE_EVENT, onMiniPlayerShare);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="player-container">
      <div
        style={{
          position: 'fixed',
          left: 8,
          top: 34,
          zIndex: 12,
        }}>
        <TutorialPopover
          title="Menu"
          context="home"
          description="Acesse outras funcionalidades do tradutor e configure sua experiência no VLibras."
          position="tl"
          floatingStyle={{ left: 0, transform: 'none' }}
          isEnabled={currentStep === HomeTutorialSteps.MENU}
        />
      </div>
      <div
        style={{
          position: 'fixed',
          right: 8,
          top: 34,
          zIndex: 12,
        }}>
        <TutorialPopover
          title="Central de ajuda"
          context="home"
          description="Clique para abrir novamente o tour guiado. Tenha uma ótima experiência VLibras!"
          position="tr"
          floatingStyle={{ right: 0, left: 'auto', transform: 'none' }}
          isEnabled={currentStep === HomeTutorialSteps.TUTORIAL}
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
          <div className="player-popover-current-speed">
            Velocidade atual: <strong>{formatSpeedLabel(speedValue)}</strong>
          </div>
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
      <IonPopover
        className="player-popover player-emotion-popover"
        event={emotionPopoverState.event}
        isOpen={emotionPopoverState.showPopover}
        onDidDismiss={() =>
          setEmotionPopoverState({ showPopover: false, event: undefined })
        }>
        <div className="player-emotion-list">
          {EMOTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`player-emotion-item ${
                selectedEmotion === option.id ? 'is-active' : ''
              }`}
              onClick={() => handleEmotion(option)}
            >
              <span
                className="player-emotion-emoji"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: option.svg }}
              />
              <span className="player-emotion-label">{option.label}</span>
            </button>
          ))}
        </div>
      </IonPopover>
      <div className="player-avatar-wrapper"
        style={{
          width: '100%',
          flexShrink: 0,
          marginBottom: HomeTutorialSteps.INITIAL === currentStep
            ? 0
            : (isPlaying || hasFinished
              ? 138
              : (currentStep === HomeTutorialSteps.DICTIONARY ||
                 currentStep === HomeTutorialSteps.TRANSLATION ||
                 currentStep === HomeTutorialSteps.HISTORY
                ? 270
                : 126)),
          background: isPlatform('ios') && visiblePlayer ? 'black' : '#E5E5E5',
        }}>
        <Unity
          unityContent={playerService.getUnity()}
          className="player-content"
        />
        {(isPlaying || hasFinished) && !isLiveListening && (
          <div className="player-overlay-top-right">
            <div style={{ position: 'relative' }}>
              <TutorialPopover
                title="Fechar"
                context="home"
                description="Feche tradução e volte à tela anterior."
                position="rt"
                floatingStyle={{
                  top: -12,
                  right: 'calc(100% + 8px)',
                  transform: 'none',
                  width: '300px',
                  maxWidth: 'calc(100vw - 28px)',
                }}
                isEnabled={currentStep === HomeTutorialSteps.CLOSE}
              />
              <button
                disabled={TUTORIAL_PLAYING_STEPS.has(currentStep)}
                className="player-button-close-overlay"
                type="button"
                onClick={handleStop}>
                <IconClose color="#FFF" size={20} />
              </button>
            </div>
          </div>
        )}
        {(isPlaying || hasFinished) && !isLiveListening && (
          <div className="player-overlay-like-anchor">
            <div style={{ position: 'relative' }}>
              <TutorialPopover
                title="Gostou da tradução?"
                context="home"
                description="Avalie e sugira melhorias."
                position="rb"
                floatingStyle={{
                  right: 'calc(100% + 10px)',
                  bottom: 0,
                  top: 'auto',
                  transform: 'none',
                  width: '300px',
                  maxWidth: 'calc(100vw - 28px)',
                }}
                isEnabled={currentStep === HomeTutorialSteps.LIKED_TRANSLATION}
              />
              <button className="player-button-like-overlay" type="button">
                <IconThumbUp color="#7D7D7D" size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* GenerateModal e ErrorModal para compartilhar - usados pela barra overlay */}
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
      <div className="player-action-container">
        {/* Campo de texto + botão Traduzir (visível apenas no estado idle) */}
        {!isPlaying && !hasFinished && !isLiveListening &&
          !TUTORIAL_PLAYING_STEPS.has(currentStep) && (
          <div className="player-translate-input-row">
            <input
              className="player-translate-input"
              type="text"
              value={translatorText}
              onChange={(e) => dispatch(TranslatorCreators.setTranslatorText(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') translateText();
              }}
            />
            <button
              className="player-translate-button"
              onClick={translateText}
              type="button"
            >
              <IconHandsTranslate color={translatorText.trim() ? '#1447a6' : '#b0b0b0'} size={20} />
              <span>Traduzir</span>
            </button>
          </div>
        )}
        <div ref={progressContainerRef} className="player-progress-container">
          <div ref={progressBarRef} className="player-progress-bar" />
        </div>
        {renderPlayerButtons()}
      </div>

      <ErrorModal
        show={showTranslateError}
        errorMsg="Erro ao tentar traduzir: caixa de texto vazia."
        setShow={setShowTranslateError}
      />

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
