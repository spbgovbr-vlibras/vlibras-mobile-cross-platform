import React, { useMemo, useRef, useState } from 'react';

import Unity, { UnityContent } from 'react-unity-webgl';

import {
  IconDictionary,
  IconMic,
  IconHistory,
  IconEdit,
  IconRefresh,
  IconClose,
  IconSubtitle,
  IconRunning,
  IconPause,
} from 'assets';

import './styles.css';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';
const PLAYER_MANAGER = 'PlayerManager';

const unityContent = new UnityContent(
  'player/playerweb.json',
  'player/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
};

const DELAY_PROGRESS = 10;
const MAX_PROGRESS = 100;

function Player() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  (window as any).onLoadPlayer = () => {
    unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
    unityContent.send(PLAYER_MANAGER, 'setURL', '');
    unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
  };

  /**
   * Event called when it is playing an animation.
   * Return glosa length and in which glosa is playing
   */
  // (window as any).CounterGlosa = (counter: number, glosaLength: number) => {
  //   console.log(counter, glosaLength);
  // }

  /**
   * Event called when user changes player state (play, pause, repeat...)
   */
  // (window as any).onPlayingStateChange = (
  //   _isPlaying: string,
  //   isPaused: string,
  //   isPlayingIntervalAnimation: string,
  //   isLoading: string,
  //   isRepeatable: string,
  // ) => {
  //   console.log(
  //     isPaused,
  //     _isPlaying,
  //     isPlayingIntervalAnimation,
  //     isLoading,
  //     isRepeatable,
  //   );
  // };

  // playNow => Event to play an animation
  // _glosa => phrase or word that will play
  // unityContent.send(PLAYER_MANAGER, 'playNow', _glosa);

  // setPauseState => Event to pause an animation
  // Third parameter to pause (1) or not (0)
  // unityContent.send(PLAYER_MANAGER, 'setPauseState', 1 or 0);

  // setSubtitlesState => Event to show subtitle
  // Third parameter to show (1) or not (0)
  // unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', 1 or 0)

  // setSlider => Event to change animation speed
  // _speed => Third parameter is the speed
  // unityContent.send(PLAYER_MANAGER, 'setSlider', _speed);

  // Change => Event to change the avatar
  // unityContent.send(PLAYER_MANAGER, 'Change')

  function handleProgressFinished() {
    setIsPlaying(false);
    setHasFinished(true);
  }

  function handleProgressPlaying() {
    progressContainerRef.current!.style.visibility = 'visible';
    setIsPlaying(true);
    setHasFinished(false);
  }

  function handleResetActionButton() {
    setIsPlaying(false);
    setHasFinished(false);
    progressContainerRef.current!.style.visibility = 'hidden';
  }

  // TODO: Improve this function to perform better [MA]
  function triggerProgress() {
    let width = 1;
    const id = setInterval(() => {
      if (width >= MAX_PROGRESS) {
        clearInterval(id);
        handleProgressFinished();
      } else {
        handleProgressPlaying();
        width += 1;
        progressBarRef.current!.style.width = `${width}%`;
      }
    }, DELAY_PROGRESS);
  }

  const ActionButtons = useMemo(() => {
    if (isPlaying) {
      return (
        <>
          <button className="player-action-button-transparent" type="button">
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={triggerProgress}
          >
            <IconPause color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
          <button
            className="player-action-button player-action-button-microphone"
            type="button"
            onClick={handleResetActionButton}
          >
            <IconClose color={buttonColors.VARIANT_BLUE} size={32} />
          </button>
          <button className="player-action-button-transparent" type="button">
            <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
          </button>
        </>
      );
    }
    if (hasFinished) {
      return (
        <>
          <button className="player-action-button-transparent" type="button">
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={triggerProgress}
          >
            <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
          <button
            className="player-action-button player-action-button-microphone"
            type="button"
            onClick={handleResetActionButton}
          >
            <IconClose color={buttonColors.VARIANT_BLUE} size={32} />
          </button>
          <button className="player-action-button-transparent" type="button">
            <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
          </button>
        </>
      );
    }
    return (
      <>
        <button className="player-action-button-transparent" type="button">
          <IconDictionary color={buttonColors.VARAINT_WHITE} />
        </button>
        <button
          className="player-action-button player-action-button-insert"
          type="button"
          onClick={triggerProgress}
        >
          <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
        </button>
        <button
          className="player-action-button player-action-button-microphone"
          type="button"
        >
          <IconMic color={buttonColors.VARIANT_BLUE} size={24} />
        </button>
        <button className="player-action-button-transparent" type="button">
          <IconHistory color={buttonColors.VARAINT_WHITE} size={32} />
        </button>
      </>
    );
  }, [isPlaying, hasFinished]);

  return (
    <div className="player-container">
      <Unity unityContent={unityContent} />
      <div className="player-action-container">
        <div ref={progressContainerRef} className="player-progress-container">
          <div ref={progressBarRef} className="player-progress-bar" />
        </div>
        <div className="play-action-content">{ActionButtons}</div>
      </div>
    </div>
  );
}

export default Player;
