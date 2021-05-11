import React, { useState } from 'react';

import Unity, { UnityContent } from 'react-unity-webgl';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';
const PLAYER_MANAGER = 'PlayerManager';

const unityContent = new UnityContent(
  'player/playerweb.json',
  'player/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

function Player() {
  const [glosa, setGlosa] = useState('');
  const [pause, setPause] = useState(false);
  const [play, setPlay] = useState(false);
  const [percent, setPercent] = useState(0);
  const [subtitle, setSubtitle] = useState(true);
  const [speedValue, setSpeedValue] = useState(1);
  const [femaleAvatar, setFemaleAvatar] = useState(false);
  const [disableButtons, setDisableButtons] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);

  const toBoolean = (state: string) => state !== 'False';
  const toInt = (sub: boolean) => (sub ? 1 : 0);

  unityContent.on('progress', (progression: number) => {
    setLoadProgress(progression * 100);
  });

  (window as any).onLoadPlayer = () => {
    unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
    unityContent.send(PLAYER_MANAGER, 'setURL', '');
    unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
    setDisableButtons(false);
  };

  (window as any).onPlayingStateChange = (
    isPlaying: string,
    isPaused: string,
    isPlayingIntervalAnimation: string,
    isLoading: string,
    isRepeatable: string,
  ) => {
    setPause(toBoolean(isPaused));
    setPlay(toBoolean(isPlaying));
    if (!toBoolean(isPlaying) && !toBoolean(isPaused)) setPercent(0);
  };

  (window as any).CounterGloss = (counter: number, glosaLength: number) => {
    const value = (counter / glosaLength) * 100;
    if (value > 100) {
      setPercent(100);
    } else {
      setPercent(value);
    }
  };

  (window as any).FinishWelcome = (flag: boolean) => ({});

  function playGlosa(_glosa: string) {
    if (_glosa) {
      setGlosa(_glosa);
      unityContent.send(PLAYER_MANAGER, 'playNow', _glosa);
    } else {
      unityContent.send(PLAYER_MANAGER, 'setPauseState', 0);
    }
  }

  function pauseGlosa() {
    unityContent.send(PLAYER_MANAGER, 'setPauseState', 1);
  }

  function toggleSubtitle() {
    unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', toInt(!subtitle));
    setSubtitle(!subtitle);
  }

  function setSpeed(speed: number) {
    setSpeedValue(speed);
    unityContent.send(PLAYER_MANAGER, 'setSlider', speed);
  }

  function changeAvatar() {
    setFemaleAvatar(!femaleAvatar);
    unityContent.send(PLAYER_MANAGER, 'Change');
  }

  return <Unity unityContent={unityContent} />;
}

export default Player;
