import React, { useRef, useState, useEffect } from 'react';

import { useHistory, useLocation } from 'react-router';
import Unity, { UnityContent } from 'react-unity-webgl';

import {
  IconDictionary,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconSubtitle,
  IconRunning,
  IconPause,
} from 'assets';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import PlayerService from 'services/unity';
import {  Types } from 'store/ducks/customization';
import { RootState } from 'store';
import { Creators } from 'store/ducks/regionalism';

import './styles.css';
import { useSelector } from 'react-redux';

type BooleanParamsPlayer = 'True' | 'False';

const unityContent = new UnityContent(
  'Build-Final/Build/NOVABUILD.json',
  'Build-Final/Build/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

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
  const history = useHistory();
  const location = useLocation();

  const currentBody = useSelector(
    ({ customization }: RootState) => customization.currentbody,
  );
  const currentEye = useSelector(
    ({ customization }: RootState) => customization.currenteye,
  );

  const currentHair = useSelector(
    ({ customization }: RootState) => customization.currenthair,
  );

  const currentShirt = useSelector(
    ({ customization }: RootState) => customization.currentshirt,
  );

  const currentPants = useSelector(
    ({ customization }: RootState) => customization.currentpants,
  );
      
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
    if (glossLen === UNDEFINED_GLOSS && GLOSS_TEXT.length < counter) {
      glossLen = counter;
    }

    console.log(GLOSS_TEXT.split(' ').length);

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
    unityContent.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
  }

  function handlePause() {
    unityContent.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_PAUSE_STATE,
      toInteger(!isPaused),
    );
  }

  function handleChangeAvatar() {
    unityContent.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.CHANGE_AVATAR);
  }

  function handleSubtitle() {
    unityContent.send(
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
    //         <IconDictionary color={buttonColors.VARAINT_WHITE} />
    //       </button>
    //       <button
    //         className="player-action-button player-action-button-insert"
    //         type="button"
    //         onClick={() => handlePlay(GLOSS_TEXT)}
    //       >
    //         <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
    //       </button>
    //       <button className="player-action-button-transparent" type="button">
    //         <IconHistory color={buttonColors.VARAINT_WHITE} size={32} />
    //       </button>
    //     </>
    //   );
    // }

  const preProcessingPreview = () => {
     const object = {
        corpo: currentBody ,
        olhos: '#fffafa',
        cabelo: currentHair,
        camisa: currentShirt,
        calca: currentPants,
        iris: currentEye,
        pos: "center",
  };
console.log(object)
  return JSON.stringify(object);
};

useEffect(() => {
  
      unityContent.send(
      PlayerKeys.AVATAR,
      PlayerKeys.SETEDITOR,
      preProcessingPreview()
    );
    
} );

    return (
      <>
        <button className="player-action-button-transparent" type="button">
          <IconDictionary color={buttonColors.VARAINT_WHITE} />
        </button>
        <button
          className="player-action-button player-action-button-insert"
          type="button"
          onClick={() => history.push(paths.TRANSLATOR)}
        >
          <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
        </button>
        <button
          className="player-action-button-transparent"
          type="button"
          onClick={() => history.push(paths.HISTORY)}
        >
          <IconHistory color={buttonColors.VARAINT_WHITE} size={32} />
        </button>
      </>
    );
  };

  return (
    <div className="player-container">
      <Unity unityContent={unityContent} />
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
