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
  IconPlay,
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

function formatSpeedLabel(speed: number): string {
  const value = Number.isInteger(speed) ? speed.toFixed(0) : String(speed);
  return `${value}x`;
}

let recording = false;
let isLoading = false;
let contador = 60;
let isBreak = false;

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: BlobPart[] = [];
let recordedMimeType = 'video/mp4';
let proxyAnimFrameId: number | null = null;
let proxyCanvas: HTMLCanvasElement | null = null;
let proxyCtx: CanvasRenderingContext2D | null = null;
let cachedPlatform: string | null = null;
let recorderStoppedPromise: Promise<void> | null = null;
Device.getInfo().then((info) => { cachedPlatform = info.platform; });

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
  const { textGloss, setTextPtBr, sentimentAnalysis, selectedEmotion } =
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

  const onBreak = () => {
    closeModal();
    isBreak = !isBreak;
  };

  const shareBlob = async (blob: Blob) => {
    try {
      const base64data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('FileReader falhou'));
        reader.readAsDataURL(blob);
      });

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
      } catch (_) {
        /** usuário cancelou o share */
      }
    } catch (e) {
      console.error('[VLibras Share] Erro em shareBlob:', e);
      openErrorModal();
    } finally {
      closeModal();
      isLoading = false;
      resetRecording();
    }
  };

  const stopProxyLoop = () => {
    if (proxyAnimFrameId !== null) {
      cancelAnimationFrame(proxyAnimFrameId);
      proxyAnimFrameId = null;
    }
  };

  const startProxyLoop = () => {
    stopProxyLoop();
    if (!proxyCanvas || !proxyCtx) return;
    const glCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    if (!glCanvas) return;
    const drawFrame = () => {
      proxyCtx!.fillStyle = '#E5E5E5';
      proxyCtx!.fillRect(0, 0, proxyCanvas!.width, proxyCanvas!.height);
      try { proxyCtx!.drawImage(glCanvas, 0, 0); } catch (_) { /* */ }
      proxyAnimFrameId = requestAnimationFrame(drawFrame);
    };
    drawFrame();
  };

  const resetRecording = () => {
    try {
      if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
      }
    } catch (_) { /* */ }
    stopProxyLoop();
    mediaRecorder = null;
    recordedChunks = [];
    proxyCanvas = null;
    proxyCtx = null;
    recorderStoppedPromise = null;
    recording = false;
  };

  const ensureRecorderStarted = (attempt = 0): boolean => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      recording = true;
      return true;
    }

    const started = initRecorder();
    if (started) {
      recording = true;
      console.log('[VLibras Share] Recorder iniciado com sucesso. tentativa:', attempt);
      return true;
    }

    if (attempt < 8) {
      window.setTimeout(() => ensureRecorderStarted(attempt + 1), 150);
    } else {
      console.warn('[VLibras Share] Não foi possível iniciar recorder após tentativas');
    }
    return false;
  };

  const initRecorder = (): boolean => {
    console.log('[VLibras Share] initRecorder chamado');
    try {
      if (typeof MediaRecorder === 'undefined') {
        console.warn('[VLibras Share] MediaRecorder não disponível');
        return false;
      }

      const glCanvas = document.querySelector('canvas') as HTMLCanvasElement | null;
      if (!glCanvas) {
        console.warn('[VLibras Share] Canvas não encontrado');
        return false;
      }

      console.log('[VLibras Share] Canvas:', glCanvas.width, 'x', glCanvas.height);
      if (glCanvas.width <= 0 || glCanvas.height <= 0) {
        console.warn('[VLibras Share] Canvas ainda sem tamanho válido, adiando initRecorder');
        return false;
      }

      if (typeof glCanvas.captureStream !== 'function') {
        console.warn('[VLibras Share] captureStream não suportado');
        return false;
      }

      const isIOS = cachedPlatform === 'ios';
      let mimeType: string;

      if (isIOS) {
        mimeType = 'video/mp4';
      } else {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : 'video/mp4';
      }

      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn('[VLibras Share] mimeType não suportado:', mimeType);
        return false;
      }

      console.log('[VLibras Share] mimeType:', mimeType);
      recordedMimeType = mimeType;

      proxyCanvas = document.createElement('canvas');
      proxyCanvas.width = glCanvas.width;
      proxyCanvas.height = glCanvas.height;
      proxyCtx = proxyCanvas.getContext('2d');
      if (!proxyCtx) {
        console.warn('[VLibras Share] Falha ao criar contexto 2D');
        return false;
      }

      startProxyLoop();

      const stream = proxyCanvas.captureStream();
      const tracks = stream.getVideoTracks();
      console.log('[VLibras Share] Stream tracks:', tracks.length);

      if (tracks.length === 0) {
        console.warn('[VLibras Share] Stream sem tracks');
        stopProxyLoop();
        return false;
      }

      mediaRecorder = new MediaRecorder(stream, { mimeType });
      recordedChunks = [];

      mediaRecorder.ondataavailable = (e) => {
        console.log('[VLibras Share] ondataavailable:', e.data.size, 'bytes');
        if (e.data.size > 0) {
          recordedChunks.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error('[VLibras Share] MediaRecorder erro:', e);
      };

      mediaRecorder.start();
      console.log('[VLibras Share] Gravação iniciada. state:', mediaRecorder.state);
      return true;
    } catch (e) {
      console.error('[VLibras Share] Falha ao inicializar:', e);
      mediaRecorder = null;
      return false;
    }
  };

  const checkBlob = (count: number, id: string) => {
    setTimeout(async () => {
      if (!isLoading || isBreak) {
        isBreak = false;
        return;
      }

      try {
        const blob = await getVideo(id);
        console.log('[VLibras Share] checkBlob tentativa', 60 - count, '- blob:', blob.size, 'bytes');
        if (blob.size > 24) {
          console.log('[VLibras Share] Vídeo convertido pronto, compartilhando...');
          await shareBlob(blob);
          return;
        }
      } catch (err) {
        console.warn('[VLibras Share] checkBlob erro:', err);
        if (count <= 0) {
          isLoading = false;
          openErrorModal();
          return;
        }
      }

      if (count <= 0) {
        isLoading = false;
        openErrorModal();
        return;
      }

      if (count === 51) {
        setShowCloseButton(true);
      }

      checkBlob(count - 1, id);
    }, 1000);
  };

  const initVideoSharing = async () => {
    isLoading = true;

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      recorderStoppedPromise = new Promise<void>((resolve) => {
        mediaRecorder!.onstop = () => {
          console.log('[VLibras Share] onstop disparado. Chunks:', recordedChunks.length);
          resolve();
        };
      });
      mediaRecorder.stop();
      stopProxyLoop();
      recording = false;
      console.log('[VLibras Share] Recorder parado, aguardando dados...');
    }

    if (recorderStoppedPromise) {
      await recorderStoppedPromise;
      recorderStoppedPromise = null;
    }

    console.log('[VLibras Share] Chunks:', recordedChunks.length, 'mimeType:', recordedMimeType);

    if (recordedChunks.length === 0) {
      console.error('[VLibras Share] Nenhum dado gravado');
      isLoading = false;
      resetRecording();
      openErrorModal();
      return;
    }

    setShowCloseButton(false);
    openModal();

    const blob = new Blob(recordedChunks, { type: recordedMimeType });
    console.log('[VLibras Share] Blob criado:', blob.size, 'bytes, tipo:', blob.type);

    if (blob.size === 0) {
      console.error('[VLibras Share] Blob vazio');
      isLoading = false;
      resetRecording();
      openErrorModal();
      return;
    }

    if (cachedPlatform === 'ios') {
      console.log('[VLibras Share] iOS: compartilhando MP4 diretamente');
      await shareBlob(blob);
      return;
    }

    try {
      console.log('[VLibras Share] Android: enviando para transcodificador...');
      const id = await postVideo({ blob });
      console.log('[VLibras Share] ID recebido:', id);
      if (id) {
        checkBlob(contador, id);
      } else {
        console.error('[VLibras Share] ID vazio na resposta');
        isLoading = false;
        openErrorModal();
      }
    } catch (err: unknown) {
      const detail = err instanceof Error
        ? { name: err.name, message: err.message }
        : { raw: String(err) };
      console.error('[VLibras Share] Erro no postVideo:', JSON.stringify(detail));
      isLoading = false;
      openErrorModal();
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

    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resetRecording();
      const success = ensureRecorderStarted();
      if (success) recording = true;
      console.log('[VLibras Share] Recorder iniciado via handlePlay:', success);
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
        handlePlay(gloss);
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

      // Gravação de vídeo: gerencia o proxy loop (recorder é iniciado em handlePlay)
      if (newIsPlaying && recording === false) {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
          startProxyLoop();
          recording = true;
        } else if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          recording = ensureRecorderStarted();
          console.log('[VLibras Share] Recorder iniciado via stateChange:', recording);
        }
      }
      if (!newIsPlaying && recording === true) {
        stopProxyLoop();
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
    resetRecording();
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
            <div className="player-speed-trigger">
              <span className="player-speed-trigger-label">
                {formatSpeedLabel(speedValue)}
              </span>
            </div>
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={handlePause}>
            {isPaused ? (
              <IconPlay hideCircle color={buttonColors.VARIANT_BLUE} size={34} />
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
            <div className="player-speed-trigger">
              <span className="player-speed-trigger-label">
                {formatSpeedLabel(speedValue)}
              </span>
            </div>
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
      <div className="player-container-button">
        {renderPlayerButtonsContainer()}
      </div>
      <div
        style={{
          width: '100vw',
          zIndex: 0,
          flexShrink: 0,
          marginBottom: HomeTutorialSteps.INITIAL === currentStep ? 0 : 70,
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
              console.log('[VLibras Share] Botão compartilhar clicado. recording:', recording);
              if (!recording) {
                initVideoSharing();
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
