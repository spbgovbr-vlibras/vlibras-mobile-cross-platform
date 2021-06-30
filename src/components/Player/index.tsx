import React, { useRef, useState } from 'react';

import Unity from 'react-unity-webgl';

import {
  IconDictionary,
  IconMic,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconClose,
  IconSubtitle,
  IconRunning,
  IconPause,
} from 'assets';
import { PlayerKeys } from 'constants/player';
import PlayerService from 'services/unity';

import './styles.css';

type BooleanParamsPlayer = 'True' | 'False';

const playerService = PlayerService.getService();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

const UNDEFINED_GLOSS = -1;
const DELAY_PROGRESS = 10;
const MAX_PROGRESS = 100;
const GLOSS_TEXT = 'A suite VLibras é um conjunto de ferramentas gratuitas';

function toBoolean(flag: BooleanParamsPlayer): boolean {
  return flag === 'True';
}

function toInteger(flag: boolean): number {
  return flag ? 1 : 0;
}

function Player() {
  // Dynamic states [MA]
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShowSubtitle, setIsShowSubtitle] = useState(true);

  // Reference to handle the progress bar [MA]
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  window.onPlayingStateChange = (
    _isPlaying: BooleanParamsPlayer,
    _isPaused: BooleanParamsPlayer,
    _isPlayingIntervalAnimation: BooleanParamsPlayer,
    _isLoading: BooleanParamsPlayer,
    _isRepeatable: BooleanParamsPlayer,
  ) => {
    setIsPlaying(toBoolean(_isPlaying));
    setIsPaused(toBoolean(_isPaused));
    setLoading(toBoolean(_isLoading));
  };

  //
  let glossLen = UNDEFINED_GLOSS;

  window.CounterGloss = (counter: number, glossLength: number) => {
    if (glossLen === UNDEFINED_GLOSS) {
      glossLen = counter;
      console.log(glossLen);
    }

    const progress = ((glossLen - counter - 1) / glossLen) * 100;

    if (progressBarRef.current) {
      progressBarRef.current.style.width = `${
        progress > MAX_PROGRESS ? MAX_PROGRESS : progress
      }%`;
    }
  };

  window.FinishWelcome = (_flag: boolean) => {
    // To avoid non-reference errors [MA]
  };

  // TODO: Improve this function to perform better [MA]
  // function triggerProgress() {
  //   let width = 1;
  //   progressBarRef.current!.style.visibility = 'visible';
  //   const id = setInterval(() => {
  //     if (width >= MAX_PROGRESS) {
  //       clearInterval(id);
  //     } else {
  //       width += 1;
  //       progressBarRef.current!.style.width = `${width}%`;
  //     }
  //   }, DELAY_PROGRESS);
  // }

  function handlePlay(gloss: string) {
    if (progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
    }
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
  }

  function handlePause() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_PAUSE_STATE,
      toInteger(!isPaused),
    );
  }

  function handleChangeAvatar() {
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.CHANGE_AVATAR);
  }

  function handleSubtitle() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_SUBTITLE_STATE,
      toInteger(!isShowSubtitle),
    );
    setIsShowSubtitle(!isShowSubtitle);
  }

  const renderPlayerButtons = () => {
    if (isPlaying) {
      return (
        <>
          <button className="player-action-button-transparent" type="button">
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={handlePause}
          >
            {isPaused ? (
              <IconPauseOutlined color={buttonColors.VARIANT_BLUE} size={24} />
            ) : (
              <IconPause color={buttonColors.VARIANT_BLUE} size={24} />
            )}
          </button>
          <button
            className="player-action-button player-action-button-microphone"
            type="button"
          >
            <IconClose color={buttonColors.VARIANT_BLUE} size={32} />
          </button>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={handleSubtitle}
          >
            <IconSubtitle
              color={
                isShowSubtitle
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
              size={32}
            />
          </button>
        </>
      );
    }
    // if (hasFinished) {
    //   return (
    //     <>
    //       <button className="player-action-button-transparent" type="button">
    //         <IconRunning color={buttonColors.VARAINT_WHITE} />
    //       </button>
    //       <button
    //         className="player-action-button player-action-button-insert"
    //         type="button"
    //         onClick={triggerProgress}
    //       >
    //         <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
    //       </button>
    //       <button
    //         className="player-action-button player-action-button-microphone"
    //         type="button"
    //         onClick={handleResetActionButton}
    //       >
    //         <IconClose color={buttonColors.VARIANT_BLUE} size={32} />
    //       </button>
    //       <button className="player-action-button-transparent" type="button">
    //         <IconSubtitle color={buttonColors.VARAINT_WHITE} size={32} />
    //       </button>
    //     </>
    //   );
    // }
    return (
      <>
        <button className="player-action-button-transparent" type="button">
          <IconDictionary color={buttonColors.VARAINT_WHITE} />
        </button>
        <button
          className="player-action-button player-action-button-insert"
          type="button"
          onClick={() => handlePlay(GLOSS_TEXT)}
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
  };

  return (
    <div className="player-container">
      <Unity unityContent={playerService.getUnity()} />
      <div className="player-action-container">
        <div ref={progressContainerRef} className="player-progress-container">
          <div ref={progressBarRef} className="player-progress-bar" />
        </div>
        <div className="play-action-content">{renderPlayerButtons()}</div>
      </div>
    </div>
  );
}

export default Player;
