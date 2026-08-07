/* eslint-disable prefer-const */
/* eslint-disable no-var */
/* eslint-disable quotes */
/* eslint-disable import/order */
/* eslint-disable react/button-has-type */
import { IonPopover } from '@ionic/react';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import RegionalismArray from 'data/regionalism';
import { Creators } from 'store/ducks/customization';
import { Creators as CreatorLoading } from 'store/ducks/loadingAction';
import { Creators as CreatorsVideo } from 'store/ducks/video';
import { Creators as TranslatorCreators } from 'store/ducks/translator';
import { reloadHistory } from 'utils/setHistory';
import { getUnityWrapper, restoreUnityTransplant, UNITY_HOME_MOUNT_ID } from 'utils/unityCanvasDock';
import StableUnityPlayer from './StableUnityPlayer';
import './styles.css';
import { getConversion, postVideo, TranscoderHttpError } from 'services/shareVideo';
import { deliverShareableVideo } from 'services/shareVideoDelivery';
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
import {
  applyAvatarCustomizationWithRetry,
  customizationColorsToPayload,
} from 'services/avatarCustomization';
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
  const errorMessageBase = 'Erro ao compartilhar o vídeo. Tente novamente.';
  const [shareErrorDetail, setShareErrorDetail] = useState('');
  const errorMessage = shareErrorDetail
    ? `${errorMessageBase} (${shareErrorDetail})`
    : errorMessageBase;

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
  const pendingShareAfterReplayRef = useRef(false);
  const autoShareRetryCountRef = useRef(0);
  /** Só grava quando o usuário disparou handlePlay (traduziu), não na saudação/idle. */
  const shareCapturePendingRef = useRef(false);
  const shareCaptureActiveRef = useRef(false);
  /** Mini player do dicionário toca via PLAY_NOW sem passar por handlePlay — refs espelham o estado. */
  const dictMiniActiveRef = useRef(false);
  const dictMiniGlossRef = useRef('');
  // --- End of Live Translation Refs ---

  const history = useHistory();

  const {
    currentStep,
    goNextStep,
    onCancel,
    hasLoadedConfigurations: hasLoadedTutotiralConfigurations,
    pendingWelcomeOverlay,
    clearPendingWelcomeOverlay,
  } = useHomeTutorial();
  const {
    textGloss,
    setTextPtBr,
    sentimentAnalysis,
    selectedEmotion,
    setSelectedEmotion,
    dictMiniPlayer,
  } = useTranslation();

  useEffect(() => {
    dictMiniActiveRef.current = dictMiniPlayer.active;
    dictMiniGlossRef.current = dictMiniPlayer.gloss || '';
  }, [dictMiniPlayer.active, dictMiniPlayer.gloss]);

  const wasPlaying = useRef<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);
  /** Evita marcar a barra em 100% quando o usuário parou com Fechar (Unity pode avisar playing=false depois). */
  const suppressPlaybackProgressCompleteRef = useRef(false);

  /**
   * Quando o teclado virtual abre, o Android (com `windowSoftInputMode=adjustResize`,
   * que é o default do Capacitor) encolhe a WebView, e o `flex: 1` faz o wrapper do
   * avatar diminuir junto. O canvas Unity acompanha esse encolhimento e o avatar
   * "se aproxima/afasta" visualmente.
   *
   * Para evitar isso, travamos a MAIOR altura já observada do CONTAINER do player
   * (`.player-container`, pai do wrapper). Esse valor é estável e independe da
   * margem inferior do wrapper (que muda por estado: idle/tradução/tutorial).
   * A altura do avatar é derivada por estado: `containerLockado - margem`.
   *
   * IMPORTANTE: só travamos quando a medição do container é > 0. No iOS o layout
   * (safe-area/tab bar) só resolve depois da 1ª pintura; medir cedo dava altura 0
   * e, com a fórmula anterior, o wrapper colapsava (canvas 0 → avatar sumia).
   */
  const avatarWrapperRef = useRef<HTMLDivElement>(null);
  const [lockedContainerHeight, setLockedContainerHeight] = useState<number | null>(null);
  useEffect(() => {
    const measure = () => {
      const container = avatarWrapperRef.current?.parentElement;
      if (!container) return;
      const height = Math.round(container.getBoundingClientRect().height);
      if (height <= 0) return;
      setLockedContainerHeight((prev) =>
        prev === null || height > prev ? height : prev
      );
    };
    /** iOS aplica safe-area/tab bar depois da primeira pintura; remede algumas vezes. */
    const timers = [50, 250, 600, 1200].map((ms) => window.setTimeout(measure, ms));
    const onOrientationChange = () => window.setTimeout(measure, 250);
    window.addEventListener('orientationchange', onOrientationChange);
    return () => {
      timers.forEach((id) => window.clearTimeout(id));
      window.removeEventListener('orientationchange', onOrientationChange);
    };
  }, []);

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

  useEffect(() => {
    if (location.pathname !== paths.HOME) return;
    if (!pendingWelcomeOverlay) return;
    if (currentStep !== HomeTutorialSteps.INITIAL) return;
    setTryShowTutorial(true);
    clearPendingWelcomeOverlay();
  }, [
    location.pathname,
    pendingWelcomeOverlay,
    currentStep,
    clearPendingWelcomeOverlay,
  ]);

  // If another route navigated back to HOME with a pending gloss to play,
  // only trigger playback after Unity has finished loading (visiblePlayer).
  const consumedPlayRef = useRef<{ gloss: string; at?: number } | null>(null);
  const pendingAutoPlayRef = useRef<{
    gloss: string;
    at?: number;
    timeoutId: number;
  } | null>(null);

  // Ao navegar Tradutor/Dicionário → HOME com playGloss, `hasFinished` pode continuar
  // true (Player segue montado; reset só ocorria em useEffect, depois do paint).
  // Um frame com overlay de "repetir" antes do autoplay — useLayoutEffect corrige antes da pintura.
  useLayoutEffect(() => {
    if (location.pathname !== paths.HOME) return;
    const playGloss = (location.state as { playGloss?: unknown } | null)?.playGloss;
    if (playGloss == null || String(playGloss).trim() === '') return;
    setHasFinished(false);
  }, [location.pathname, location.state]);

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
      if (!shareCaptureActiveRef.current) {
        resetRecording();
      }
      setTryShowTutorial(true);
      handleStop();
    }
  };

  const openErrorModal = (detail?: string) => {
    if (detail) {
      console.error('[VLibras Share] Etapa com falha:', detail);
      setShareErrorDetail(detail);
    } else {
      setShareErrorDetail('');
    }
    setErrorModalOpen(true);
    closeModal();
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
    setShareErrorDetail('');
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

  const getUnityCanvas = (): HTMLCanvasElement | null => {
    const fromWrapper = avatarWrapperRef.current?.querySelector('canvas');
    if (fromWrapper instanceof HTMLCanvasElement) {
      return fromWrapper;
    }
    const fromGlobal = getUnityWrapper()?.querySelector('canvas');
    if (fromGlobal instanceof HTMLCanvasElement) {
      return fromGlobal;
    }
    const fallback = document.querySelector(
      '.player-content canvas, .global-player-canvas canvas, canvas'
    );
    return fallback instanceof HTMLCanvasElement ? fallback : null;
  };

  const shareBlob = async (blob: Blob) => {
    try {
      await deliverShareableVideo(blob);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (/cancel|canceled|abort/i.test(msg)) {
        console.log('[VLibras Share] Compartilhamento cancelado pelo usuário');
        return;
      }
      console.error('[VLibras Share] Erro em shareBlob:', e);
      openErrorModal('abrir compartilhamento');
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
    const glCanvas = getUnityCanvas();
    if (!glCanvas) return;
    const drawFrame = () => {
      if (
        proxyCanvas!.width !== glCanvas.width ||
        proxyCanvas!.height !== glCanvas.height
      ) {
        proxyCanvas!.width = glCanvas.width;
        proxyCanvas!.height = glCanvas.height;
      }
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
    try {
      mediaRecorder?.stream?.getTracks().forEach((track) => track.stop());
    } catch (_) { /* */ }
    stopProxyLoop();
    mediaRecorder = null;
    recordedChunks = [];
    proxyCanvas = null;
    proxyCtx = null;
    recorderStoppedPromise = null;
    recording = false;
    shareCapturePendingRef.current = false;
    shareCaptureActiveRef.current = false;
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

      const glCanvas = getUnityCanvas();
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
      let stream: MediaStream;

      if (isIOS) {
        mimeType = 'video/mp4';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn('[VLibras Share] mimeType não suportado:', mimeType);
          return false;
        }
        recordedMimeType = mimeType;
        stream = glCanvas.captureStream(30);
        console.log('[VLibras Share] iOS: captureStream direto do WebGL');
      } else {
        mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : MediaRecorder.isTypeSupported('video/webm')
            ? 'video/webm'
            : 'video/mp4';

        if (!MediaRecorder.isTypeSupported(mimeType)) {
          console.warn('[VLibras Share] mimeType não suportado:', mimeType);
          return false;
        }

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
        stream = proxyCanvas.captureStream(30);
        console.log('[VLibras Share] Android: proxy canvas + captureStream');
      }

      console.log('[VLibras Share] mimeType:', mimeType);
      const tracks = stream.getVideoTracks();
      console.log('[VLibras Share] Stream tracks:', tracks.length);

      if (tracks.length === 0) {
        console.warn('[VLibras Share] Stream sem tracks');
        stopProxyLoop();
        return false;
      }

      mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2_500_000,
      });
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

      mediaRecorder.start(250);
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
        const result = await getConversion(id);

        if (result.kind === 'ready') {
          console.log('[VLibras Share] Vídeo convertido pronto, compartilhando...');
          await shareBlob(result.blob);
          return;
        }

        if (result.kind === 'failed') {
          console.error('[VLibras Share] Conversão falhou no servidor:', result.status);
          isLoading = false;
          resetRecording();
          openErrorModal('conversão no servidor');
          return;
        }

        console.log(
          '[VLibras Share] checkBlob tentativa', 60 - count, '- status:', result.status
        );
      } catch (err) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        console.warn('[VLibras Share] checkBlob erro:', status ?? '', err);
        if (count <= 0) {
          isLoading = false;
          openErrorModal('consultar transcodificador');
          return;
        }
      }

      if (count <= 0) {
        isLoading = false;
        openErrorModal('tempo esgotado conversão');
        return;
      }

      if (count === 51) {
        setShowCloseButton(true);
      }

      checkBlob(count - 1, id);
    }, 1000);
  };

  const initVideoSharing = async () => {
    if (isLoading) return;
    isLoading = true;
    console.log('[VLibras Share] Início compartilhamento');

    if (
      recordedChunks.length === 0 &&
      mediaRecorder &&
      mediaRecorder.state === 'recording'
    ) {
      shareCaptureActiveRef.current = true;
      if (!proxyAnimFrameId) {
        startProxyLoop();
      }
    }

    if (mediaRecorder && mediaRecorder.state === 'recording') {
      try {
        mediaRecorder.requestData();
      } catch (_) { /* */ }
      recorderStoppedPromise = new Promise<void>((resolve) => {
        mediaRecorder!.onstop = () => {
          stopProxyLoop();
          console.log('[VLibras Share] onstop disparado. Chunks:', recordedChunks.length);
          resolve();
        };
      });
      mediaRecorder.stop();
      recording = false;
      console.log('[VLibras Share] Recorder parado, aguardando dados...');
    }

    if (recorderStoppedPromise) {
      await recorderStoppedPromise;
      recorderStoppedPromise = null;
      /** Android WebView: últimos ondataavailable podem chegar após onstop. */
      await new Promise((r) => window.setTimeout(r, 350));
    }

    console.log('[VLibras Share] Chunks:', recordedChunks.length, 'mimeType:', recordedMimeType);

    if (recordedChunks.length === 0) {
      const glossForShare =
        textGloss ||
        (dictMiniActiveRef.current ? dictMiniGlossRef.current : '');
      const canAutoReplay =
        Boolean(glossForShare) && !isPlaying && autoShareRetryCountRef.current === 0;
      if (canAutoReplay) {
        console.warn(
          '[VLibras Share] Nenhum dado gravado. Replay automático (tradutor ou dicionário)...'
        );
        autoShareRetryCountRef.current = 1;
        pendingShareAfterReplayRef.current = true;
        isLoading = false;
        closeModal();
        handlePlay(glossForShare);
        return;
      }
      console.error('[VLibras Share] Nenhum dado gravado');
      autoShareRetryCountRef.current = 0;
      isLoading = false;
      resetRecording();
      openErrorModal('gravação vazia');
      return;
    }

    setShowCloseButton(false);
    openModal();

    const blob = new Blob(recordedChunks, { type: recordedMimeType });
    console.log('[VLibras Share] Blob criado:', blob.size, 'bytes, tipo:', blob.type);

    if (blob.size === 0) {
      console.error('[VLibras Share] Blob vazio');
      autoShareRetryCountRef.current = 0;
      isLoading = false;
      resetRecording();
      openErrorModal('vídeo gravado vazio');
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
      autoShareRetryCountRef.current = 0;
      if (id) {
        checkBlob(contador, id);
      } else {
        console.error('[VLibras Share] ID vazio na resposta');
        isLoading = false;
        openErrorModal('resposta transcodificador');
      }
    } catch (err: unknown) {
      if (err instanceof TranscoderHttpError) {
        console.error(
          '[VLibras Share] Erro no postVideo:',
          err.status,
          err.bodySnippet
        );
        autoShareRetryCountRef.current = 0;
        isLoading = false;
        openErrorModal(
          err.status > 0
            ? `enviar transcodificador HTTP ${err.status}`
            : err.bodySnippet.includes('EBML')
              ? 'gravação WebM inválida'
              : err.bodySnippet.trim()
                ? `enviar transcodificador (${err.bodySnippet.slice(0, 100)})`
                : 'enviar transcodificador sem rede'
        );
        return;
      }
      const ax = err as {
        response?: { status?: number; data?: unknown };
        message?: string;
      };
      const detail = {
        status: ax.response?.status,
        message: ax.message,
        body:
          typeof ax.response?.data === 'string'
            ? ax.response.data.slice(0, 200)
            : ax.response?.data,
      };
      console.error('[VLibras Share] Erro no postVideo:', JSON.stringify(detail));
      autoShareRetryCountRef.current = 0;
      isLoading = false;
      const msg =
        typeof ax.message === 'string' && ax.message.trim()
          ? ax.message.slice(0, 100)
          : '';
      openErrorModal(
        msg ? `enviar transcodificador (${msg})` : 'enviar transcodificador'
      );
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

  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );

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

    const regionAbbrev =
      RegionalismArray.find((item) => item.name === currentRegionalism.name)
        ?.abbreviation ?? '';

    const onUnityReady = () => {
      if (handled) return;
      handled = true;
      /**
       * Alinha `getIsReady()` com o WebGL mesmo quando `onLoadPlayer` do Unity
       * disparou antes de `Home.load()` registrar o listener (corrida típica).
       */
      playerService.initializeUnityBridge(regionAbbrev);
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
  }, [dispatch, currentRegionalism.name]);

  // Quando o mini player fecha, recoloca o canvas no Player (qualquer rota).
  useLayoutEffect(() => {
    if (dictMiniPlayer.active || !visiblePlayer) return;
    restoreUnityTransplant();
  }, [dictMiniPlayer.active, visiblePlayer, location.pathname]);

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
    setHasFinished(false);
    suppressPlaybackProgressCompleteRef.current = false;
    playbackProgressRef.current = {
      counter: 0,
      glossLength: 0,
      lastUpdateAt: Date.now(),
    };
    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = '0%';
    }
    dispatch(CreatorsVideo.setProgress(0));

    resetRecording();
    shareCapturePendingRef.current = true;
    shareCaptureActiveRef.current = false;
    autoShareRetryCountRef.current = 0;

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
    suppressPlaybackProgressCompleteRef.current = true;
    sessionStorage.removeItem('dictionaryState');
    shareCapturePendingRef.current = false;
    shareCaptureActiveRef.current = false;
    resetRecording();
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
    setHasFinished(false);
    playbackProgressRef.current = {
      counter: 0,
      glossLength: 0,
      lastUpdateAt: 0,
    };
    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.width = '0%';
    }
    dispatch(CreatorsVideo.setProgress(0));
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
        if (!suppressPlaybackProgressCompleteRef.current) {
          setHasFinished(true);
          // Faixa azul: ao terminar a frase, garante 100% se o último CounterGloss não chegou lá.
          if (progressBarRef.current && progressContainerRef.current) {
            progressContainerRef.current.style.visibility = 'visible';
            progressBarRef.current.style.visibility = 'visible';
            progressBarRef.current.style.width = '100%';
          }
          dispatch(CreatorsVideo.setProgress(100));
        } else {
          suppressPlaybackProgressCompleteRef.current = false;
        }
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

        if (pendingShareAfterReplayRef.current) {
          pendingShareAfterReplayRef.current = false;
          console.log('[VLibras Share] Replay automático finalizado. Tentando compartilhar novamente...');
          setTimeout(() => {
            initVideoSharing();
          }, 120);
        }
      }

      wasPlaying.current = newIsPlaying;

      // Gravação: tradutor (handlePlay) ou mini player do dicionário (PLAY_NOW direto)
      if (newIsPlaying && (shareCapturePendingRef.current || dictMiniActiveRef.current)) {
        shareCapturePendingRef.current = false;
        shareCaptureActiveRef.current = true;
        resetRecording();
        const started = ensureRecorderStarted();
        recording = started;
        console.log(
          '[VLibras Share] Recorder iniciado:',
          started,
          'origem:',
          dictMiniActiveRef.current ? 'dicionário' : 'tradutor'
        );
      } else if (
        newIsPlaying &&
        shareCaptureActiveRef.current &&
        !recording &&
        mediaRecorder &&
        mediaRecorder.state === 'recording'
      ) {
        startProxyLoop();
        recording = true;
      }

      if (!newIsPlaying && recording) {
        /*
         * Só libera o botão de compartilhar; NÃO paramos o proxy loop aqui.
         * No Android, parar drawImage antes do MediaRecorder.stop() deixa o
         * webm vazio ou inválido e o transcodificador falha depois.
         */
        recording = false;
      }
    },
    [processTranslationQueue, dispatch]
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
      progressBarRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.width = '0%';
    }
    playbackProgressRef.current = {
      counter: 0,
      glossLength: 0,
      lastUpdateAt: 0,
    };
    dispatch(CreatorsVideo.setProgress(0));
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

    const progress =
      glossLength > 0
        ? Math.min(
            100,
            Math.max(0, (counter / glossLength) * 100)
          )
        : 0;

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = `${progress}%`;
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

  function renderCurrentAvatarSilhouette(size = 28) {
    const common = { width: size, height: size, 'aria-hidden': true } as const;
    if (currentAvatar === 'hozana') return <HozanaAvatar {...common} />;
    if (currentAvatar === 'guga') return <GugaAvatar {...common} />;
    return <IcaroAvatar {...common} />;
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
            if (isLoading) return;
            void initVideoSharing();
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
    if (!visiblePlayer || !hasLoadedAvatarOnce) return undefined;

    return applyAvatarCustomizationWithRetry(
      customizationColorsToPayload(currentAvatar, {
        corpo: currentBody,
        cabelo: currentHair,
        camisa: currentShirt,
        calca: currentPants,
        iris: currentEye,
      })
    );
  }, [
    visiblePlayer,
    hasLoadedAvatarOnce,
    currentAvatar,
    currentBody,
    currentHair,
    currentShirt,
    currentPants,
    currentEye,
  ]);

  // The dictionary mini player relays its share button via this event because
  // the recorder + share state lives here in the Home Player. We handle it
  // exactly the same way as a tap on the Player's own share button.
  useEffect(() => {
    const onMiniPlayerShare = () => {
      if (isLoading) return;
      void initVideoSharing();
    };
    window.addEventListener(MINI_PLAYER_SHARE_EVENT, onMiniPlayerShare);
    return () => {
      window.removeEventListener(MINI_PLAYER_SHARE_EVENT, onMiniPlayerShare);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * INITIAL (estado de partida, antes de virar IDLE) usa a MESMA margem do idle.
   * Antes usava 0, o que fazia o avatar ocupar o container inteiro na abertura e
   * aparecer "grande/para frente" até reenquadrar. Agora o enquadramento é
   * consistente desde a primeira pintura.
   */
  const avatarMarginBottom =
    isPlaying || hasFinished
      ? 138
      : currentStep === HomeTutorialSteps.DICTIONARY ||
        currentStep === HomeTutorialSteps.TRANSLATION ||
        currentStep === HomeTutorialSteps.HISTORY
        ? 270
        : 126;

  /**
   * Enquanto o container não foi medido (ou mediu 0), deixamos o wrapper em
   * `flex: 1` (comportamento idêntico à web). Depois de travado, a altura do
   * avatar é a faixa do container menos a margem do estado atual.
   */
  const avatarHeight =
    lockedContainerHeight === null
      ? undefined
      : Math.max(0, lockedContainerHeight - avatarMarginBottom);

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
          title="Ajuda e informações"
          context="home"
          description={
            'Toque aqui para abrir a Central de ajuda (tutoriais e contato) ou Sobre o VLibras. ' +
            'Para repetir este tour, use o botão "Refazer tour guiado" na Central de ajuda.'
          }
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
      <div
        ref={avatarWrapperRef}
        className="player-avatar-wrapper"
        style={{
          width: '100%',
          flexShrink: 0,
          flexGrow: avatarHeight === undefined ? undefined : 0,
          flexBasis: avatarHeight === undefined ? undefined : 'auto',
          height: avatarHeight === undefined ? undefined : `${avatarHeight}px`,
          marginBottom: avatarMarginBottom,
          background: '#E5E5E5',
        }}>
        <div id={UNITY_HOME_MOUNT_ID} className="player-unity-mount">
          <StableUnityPlayer />
        </div>
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
              <button
                className="player-button-like-overlay"
                type="button"
                aria-label="Avaliar tradução"
                onClick={() => setShowModal(true)}>
                <IconThumbUp color="#7D7D7D" size={20} />
              </button>
            </div>
          </div>
        )}
        {!isPlaying && !hasFinished && !isLiveListening &&
          !TUTORIAL_PLAYING_STEPS.has(currentStep) && (
          <button
            type="button"
            className="player-avatar-switch-overlay"
            aria-label="Trocar avatar"
            onClick={() => handleChangeAvatar()}>
            <span className="player-avatar-switch-icon">
              {renderCurrentAvatarSilhouette(42)}
            </span>
          </button>
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
              placeholder={Strings.TRANSLATE_INPUT_PLACEHOLDER}
              value={translatorText}
              onChange={(e) => dispatch(TranslatorCreators.setTranslatorText(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') translateText();
              }}
            />
            <button
              className={`player-translate-button ${
                translatorText.trim()
                  ? 'player-translate-button--ready'
                  : 'player-translate-button--empty'
              }`}
              onClick={translateText}
              type="button"
            >
              <IconHandsTranslate
                color={translatorText.trim() ? '#1447a6' : '#ffffff'}
                size={22}
              />
            </button>
          </div>
        )}
        <div
          ref={progressContainerRef}
          className={`player-progress-container${
            !isPlaying && !hasFinished && !isLiveListening
              ? ' player-progress-container--idle'
              : ''
          }`}>
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
