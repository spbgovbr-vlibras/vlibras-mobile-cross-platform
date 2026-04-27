import { IonIcon, IonPopover } from '@ionic/react';
import { expand } from 'ionicons/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

const SPEED_OPTIONS = [2.5, 2, 1.5, 1, 0.5];

function formatSpeedLabel(speed: number): string {
  return Number.isInteger(speed) ? `${speed.toFixed(0)}x` : `${speed}x`;
}

interface DictionaryMiniPlayerProps {
  gloss: string;
  onClose: () => void;
}

const playerService = UnityService.getPlayerInstance();

/**
 * Custom event names used to delegate work that lives in the Home Player
 * component (recording state and video sharing). The Player listens to these
 * events globally so we can keep that complex state in a single place.
 */
export const MINI_PLAYER_SHARE_EVENT = 'vlibras:mini-player:share';

/**
 * The IonRouterOutlet keeps every visited page mounted (native-like stack
 * navigation), so the Home page (and its <Unity /> with the player instance)
 * is still alive when we navigate to /dictionary-player. Mounting a second
 * <Unity /> with a separate editorInstance causes two WebGL contexts to fight
 * for GPU resources, resulting in a black canvas.
 *
 * To avoid that, we transplant the existing Unity wrapper element (the one
 * created by react-unity-webgl on the Home) into our mini player container
 * via DOM appendChild. WebGL contexts survive DOM moves, so this preserves
 * the loaded avatar without re-initialising Unity. When the mini player
 * unmounts we put the wrapper back where it was, so the Home keeps working.
 */
const DictionaryMiniPlayer: React.FC<DictionaryMiniPlayerProps> = ({
  gloss,
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

  // Evaluation modal state (mirrors the same modal used by the home Player).
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showSuggestionFeedbackModal, setShowSuggestionFeedbackModal] =
    useState(false);

  const lastGlossRef = useRef<string>('');
  // Skip STOP_ALL on unmount when the user expands to the home: the avatar
  // must keep playing across the navigation transition.
  const skipStopOnUnmountRef = useRef(false);

  // Move the Unity wrapper DOM node into our container while the mini player
  // is mounted, and restore it on cleanup. We never unmount react-unity-webgl,
  // so the Unity instance is preserved.
  useEffect(() => {
    const unityContent: any = playerService.getUnity();
    const wrapperId = `__ReactUnityWebGL_${unityContent.uniqueID}__`;
    const host = canvasHostRef.current;
    if (!host) return;

    let cancelled = false;
    let wrapper: HTMLElement | null = null;
    let originalParent: HTMLElement | null = null;
    let originalNextSibling: ChildNode | null = null;
    let placeholder: Comment | null = null;
    let previousStyles: { width: string; height: string; position: string } | null = null;

    const transplant = (node: HTMLElement) => {
      if (cancelled) return;
      wrapper = node;
      originalParent = node.parentElement;
      originalNextSibling = node.nextSibling;
      placeholder = document.createComment('vlibras-mini-player-anchor');
      if (originalParent) {
        originalParent.insertBefore(placeholder, node);
      }
      previousStyles = {
        width: node.style.width,
        height: node.style.height,
        position: node.style.position,
      };
      node.style.width = '100%';
      node.style.height = '100%';
      node.style.position = 'relative';
      host.appendChild(node);
      if (!cancelled) setHasCanvas(true);
      window.dispatchEvent(new Event('resize'));
    };

    const initial = document.getElementById(wrapperId) as HTMLElement | null;
    let observer: MutationObserver | null = null;
    if (initial) {
      transplant(initial);
    } else {
      // The Home (and therefore the Unity wrapper) hasn't been mounted yet.
      // Watch the DOM and transplant as soon as react-unity-webgl creates it.
      observer = new MutationObserver(() => {
        if (cancelled) return;
        const node = document.getElementById(wrapperId) as HTMLElement | null;
        if (node) {
          transplant(node);
          observer?.disconnect();
          observer = null;
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      if (wrapper && previousStyles) {
        wrapper.style.width = previousStyles.width;
        wrapper.style.height = previousStyles.height;
        wrapper.style.position = previousStyles.position;
      }
      if (wrapper && placeholder) {
        const anchorParent = placeholder.parentNode;
        if (anchorParent) {
          anchorParent.insertBefore(wrapper, placeholder);
          anchorParent.removeChild(placeholder);
        } else if (originalParent) {
          if (
            originalNextSibling &&
            originalNextSibling.parentNode === originalParent
          ) {
            originalParent.insertBefore(wrapper, originalNextSibling);
          } else {
            originalParent.appendChild(wrapper);
          }
        }
      }
      window.dispatchEvent(new Event('resize'));
    };
  }, []);

  useOnPlayingStateChangeHandler(
    (playing: boolean, paused: boolean) => {
      setIsPlaying(playing);
      setIsPaused(paused);
    },
    []
  );

  // Auto-play whenever a new gloss is requested. We poll readiness because
  // the user can request a sign before Unity finishes loading.
  useEffect(() => {
    if (!gloss) return;
    if (gloss === lastGlossRef.current) return;
    lastGlossRef.current = gloss;

    let timeoutId: number;
    let cancelled = false;
    const tryPlay = () => {
      if (cancelled) return;
      if ((playerService as any).getIsReady?.()) {
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
  }, [gloss]);

  // Stop the avatar when the mini player closes so it doesn't keep playing
  // silently in the (still mounted) Home page. Skipped when the user expands
  // to the home, where playback should continue seamlessly.
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
    // Move avatar back to home and keep playing without restarting it.
    skipStopOnUnmountRef.current = true;
    setDictMiniPlayer(false);
    history.push(paths.HOME);
  }, [history, setDictMiniPlayer]);

  const handleShare = useCallback(() => {
    // Delegates the heavy video-sharing logic (canvas recording + native share)
    // to the Home Player which owns the recorder state. The Player listens to
    // this event globally and triggers `initVideoSharing`.
    window.dispatchEvent(new CustomEvent(MINI_PLAYER_SHARE_EVENT));
  }, []);

  const handleOpenEvaluation = useCallback(() => {
    setShowEvaluationModal(true);
  }, []);

  // The play/pause/refresh button mirrors the Home Player visually:
  // a solid blue circle with a white icon inside (and a refresh icon when the
  // avatar is idle). All inner icons share the same size so the button never
  // changes its visual weight between states.
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
          onClick={onClose}
          aria-label="Fechar"
        >
          <IconClose color="#FFFFFF" size={14} />
        </button>
      </div>

      <div className="dict-mini-player-canvas-area" ref={canvasHostRef}>
        {!hasCanvas && (
          <div className="dict-mini-player-loading">
            Inicializando avatar…
            <br />
            <small>
              Volte ao Tradutor para carregar e tente novamente.
            </small>
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
