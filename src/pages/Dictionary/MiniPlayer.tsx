import { IonIcon, IonPopover } from '@ionic/react';
import { expand } from 'ionicons/icons';
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router';

import {
  IconClose,
  IconPause,
  IconPlay,
  IconShare,
  IconThumbUp,
  logoRefresh,
  logoSubtitleOff,
  logoSubtitleOn,
} from 'assets';
import IconEmotions from 'assets/icons/IconEmotions';
import EvaluationModal from 'components/EvaluationModal';
import { EMOTION_OPTIONS, EmotionOption } from 'constants/emotions';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import { useOnPlayingStateChangeHandler } from 'hooks/unityHooks';
import UnityService from 'services/unity';
import {
  getUnityWrapper,
  isUnityTransplanted,
  restoreUnityTransplant,
  transplantUnityToHost,
} from 'utils/unityCanvasDock';

const SPEED_OPTIONS = [2.5, 2, 1.5, 1, 0.5];

function formatSpeedLabel(speed: number): string {
  return Number.isInteger(speed) ? `${speed.toFixed(0)}x` : `${speed}x`;
}

interface DictionaryMiniPlayerProps {
  gloss: string;
  loading?: boolean;
  playRequestId?: number;
  onClose: () => void;
}

const playerService = UnityService.getPlayerInstance();

export const MINI_PLAYER_SHARE_EVENT = 'vlibras:mini-player:share';

/**
 * IonRouterOutlet oculta a Home no dicionário — CSS fixed não renderiza WebGL.
 * Transplantamos o wrapper para o mini player (appendChild); o <Unity /> da Home
 * continua montado. No cleanup o nó volta ao mount fixo da Home.
 */
const DictionaryMiniPlayer: React.FC<DictionaryMiniPlayerProps> = ({
  gloss,
  loading = false,
  playRequestId = 0,
  onClose,
}) => {
  const history = useHistory();
  const {
    setDictMiniPlayer,
    selectedEmotion,
    setSelectedEmotion,
  } = useTranslation();

  const canvasHostRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [speedValue, setSpeedValue] = useState(1);
  const [hasCanvas, setHasCanvas] = useState(false);
  const [speedPopoverState, setSpeedPopoverState] = useState<{
    show: boolean;
    event?: React.MouseEvent;
  }>({ show: false });
  const [emotionPopoverState, setEmotionPopoverState] = useState<{
    show: boolean;
    event?: React.MouseEvent;
  }>({ show: false });

  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showSuggestionFeedbackModal, setShowSuggestionFeedbackModal] =
    useState(false);

  const skipStopOnUnmountRef = useRef(false);
  const lastPlayedRef = useRef<{ gloss: string; requestId: number } | null>(
    null
  );

  const handleClose = useCallback(() => {
    restoreUnityTransplant();
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const host = canvasHostRef.current;
    if (!host) return undefined;

    let cancelled = false;
    let pollTimer: number | null = null;
    let observer: MutationObserver | null = null;

    const stopWaiting = () => {
      if (pollTimer !== null) {
        window.clearInterval(pollTimer);
        pollTimer = null;
      }
      observer?.disconnect();
      observer = null;
    };

    const tryAttach = () => {
      if (cancelled) return;

      const wrapper = getUnityWrapper();
      if (!wrapper) return;

      if (isUnityTransplanted() && host.contains(wrapper)) {
        setHasCanvas(true);
        stopWaiting();
        return;
      }

      if (transplantUnityToHost(host)) {
        setHasCanvas(true);
        stopWaiting();
      }
    };

    tryAttach();
    if (!getUnityWrapper() || !host.contains(getUnityWrapper()!)) {
      observer = new MutationObserver(tryAttach);
      observer.observe(document.body, { childList: true, subtree: true });
      pollTimer = window.setInterval(tryAttach, 300);
    }

    return () => {
      cancelled = true;
      stopWaiting();
      restoreUnityTransplant();
      setHasCanvas(false);
    };
  }, []);

  useOnPlayingStateChangeHandler(
    (playing: boolean, paused: boolean) => {
      setIsPlaying(playing);
      setIsPaused(paused);
    },
    []
  );

  useEffect(() => {
    if (!gloss) return;

    const playKey = { gloss, requestId: playRequestId };
    if (
      lastPlayedRef.current?.gloss === playKey.gloss &&
      lastPlayedRef.current?.requestId === playKey.requestId
    ) {
      return;
    }

    let timeoutId: number;
    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      if ((playerService as any).getIsReady?.()) {
        lastPlayedRef.current = playKey;
        playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
        playerService.send(
          PlayerKeys.PLAYER_MANAGER,
          PlayerKeys.PLAY_NOW,
          gloss
        );
        return;
      }
      timeoutId = window.setTimeout(tryPlay, 250);
    };
    tryPlay();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [gloss, playRequestId]);

  useEffect(() => {
    return () => {
      if (skipStopOnUnmountRef.current) return;
      try {
        playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.STOP_ALL);
      } catch {
        /* ignore */
      }
    };
  }, []);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      playerService.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.SET_PAUSE_STATE,
        isPaused ? 0 : 1
      );
      return;
    }
    if (gloss) {
      playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
    }
  }, [isPlaying, isPaused, gloss]);

  const handleSpeed = useCallback((speed: number) => {
    setSpeedValue(speed);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.SET_SLIDER, speed);
    setSpeedPopoverState({ show: false });
  }, []);

  const handleEmotion = useCallback(
    (option: EmotionOption) => {
      setSelectedEmotion(option.id);
      playerService.send(PlayerKeys.EMOTION_BRIDGE, option.applyKey);
      setEmotionPopoverState({ show: false });
    },
    [setSelectedEmotion]
  );

  const handleSubtitle = useCallback(() => {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_SUBTITLE_STATE,
      showSubtitle ? 0 : 1
    );
    setShowSubtitle(!showSubtitle);
  }, [showSubtitle]);

  const handleExpand = useCallback(() => {
    skipStopOnUnmountRef.current = true;
    restoreUnityTransplant();
    setDictMiniPlayer(false);
    history.push(paths.HOME);
  }, [history, setDictMiniPlayer]);

  const handleShare = useCallback(() => {
    window.dispatchEvent(new CustomEvent(MINI_PLAYER_SHARE_EVENT));
  }, []);

  const handleOpenEvaluation = useCallback(() => {
    setShowEvaluationModal(true);
  }, []);

  const renderPlayPauseIcon = () => {
    if (!isPlaying) {
      return (
        <img
          src={logoRefresh}
          alt="Reproduzir novamente"
          className="dict-mini-pause-refresh"
        />
      );
    }
    if (isPaused) {
      return <IconPlay hideCircle color="#FFFFFF" size={22} />;
    }
    return <IconPause color="#FFFFFF" size={22} />;
  };

  return (
    <div className="dict-mini-player" role="dialog" aria-label="Avatar minimizado">
      <div className="dict-mini-player-header">
        <button
          className="dict-mini-player-expand"
          type="button"
          aria-label="Expandir para tela cheia"
          onClick={handleExpand}
        >
          <IonIcon icon={expand} style={{ fontSize: 16, color: '#1447a6' }} />
        </button>
        <button
          className="dict-mini-player-close"
          type="button"
          onClick={handleClose}
          aria-label="Fechar"
        >
          <IconClose color="#FFFFFF" size={14} />
        </button>
      </div>

      <div className="dict-mini-player-canvas-area" ref={canvasHostRef}>
        {!hasCanvas && (
          <div className="dict-mini-player-loading">
            <div className="dict-mini-player-spinner" />
            <span className="dict-mini-player-loading-title">
              Inicializando avatar…
            </span>
            <small>
              Abra o Tradutor para carregar o avatar antes de traduzir aqui.
            </small>
          </div>
        )}
        {hasCanvas && loading && (
          <div className="dict-mini-player-overlay">
            <div className="dict-mini-player-spinner" />
            <span>Traduzindo…</span>
          </div>
        )}
      </div>

      <button
        className="dict-mini-like-btn"
        type="button"
        aria-label="Avaliar tradução"
        onClick={handleOpenEvaluation}
      >
        <IconThumbUp color="#7D7D7D" size={20} />
      </button>

      <div className="dict-mini-player-controls">
        <button
          className="dict-mini-pause-btn"
          type="button"
          onClick={handlePlayPause}
          aria-label="Reproduzir / Pausar"
        >
          {renderPlayPauseIcon()}
        </button>

        <button
          className="dict-mini-ctrl-btn dict-mini-speed-btn"
          type="button"
          onClick={(e) => {
            e.persist();
            setSpeedPopoverState({ show: true, event: e });
          }}
        >
          <span>{formatSpeedLabel(speedValue)}</span>
        </button>

        <button
          className="dict-mini-ctrl-btn"
          type="button"
          aria-label="Mudar emoção do avatar"
          onClick={(e) => {
            e.persist();
            setEmotionPopoverState({ show: true, event: e });
          }}
        >
          <IconEmotions color="#1447a6" size={22} />
        </button>

        <button
          className="dict-mini-ctrl-btn"
          type="button"
          onClick={handleSubtitle}
          aria-label="Legenda"
        >
          <img
            src={showSubtitle ? logoSubtitleOn : logoSubtitleOff}
            alt="Legenda"
            className="dict-mini-ctrl-img"
          />
        </button>

        <button
          className="dict-mini-ctrl-btn"
          type="button"
          aria-label="Compartilhar"
          onClick={handleShare}
        >
          <IconShare color="#1447a6" size={22} />
        </button>
      </div>

      <IonPopover
        className="dict-mini-popover"
        event={speedPopoverState.event as any}
        isOpen={speedPopoverState.show}
        onDidDismiss={() => setSpeedPopoverState({ show: false })}
      >
        <div className="dict-mini-popover-content">
          {SPEED_OPTIONS.map((option, idx) => (
            <React.Fragment key={option}>
              <button
                type="button"
                className={`dict-mini-popover-item ${
                  speedValue === option ? 'is-active' : ''
                }`}
                onClick={() => handleSpeed(option)}
              >
                {formatSpeedLabel(option)}
              </button>
              {idx < SPEED_OPTIONS.length - 1 && (
                <div className="dict-mini-popover-divider" />
              )}
            </React.Fragment>
          ))}
        </div>
      </IonPopover>

      <IonPopover
        className="dict-mini-popover dict-mini-emotion-popover"
        event={emotionPopoverState.event as any}
        isOpen={emotionPopoverState.show}
        onDidDismiss={() => setEmotionPopoverState({ show: false })}
      >
        <div className="dict-mini-emotion-list">
          {EMOTION_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`dict-mini-emotion-item ${
                selectedEmotion === option.id ? 'is-active' : ''
              }`}
              onClick={() => handleEmotion(option)}
            >
              <span
                className="dict-mini-emotion-emoji"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: option.svg }}
              />
              <span className="dict-mini-emotion-label">{option.label}</span>
            </button>
          ))}
        </div>
      </IonPopover>

      <EvaluationModal
        show={showEvaluationModal}
        setShow={setShowEvaluationModal}
        showYes={showYesModal}
        setShowYes={setShowYesModal}
        showNo={showNoModal}
        setShowNo={setShowNoModal}
        showSuggestionModal={showSuggestionModal}
        setShowSuggestionModal={setShowSuggestionModal}
        showSuggestionFeedbackModal={showSuggestionFeedbackModal}
        setSuggestionFeedbackModal={setShowSuggestionFeedbackModal}
        isPlaying={isPlaying}
      />
    </div>
  );
};

export default DictionaryMiniPlayer;
