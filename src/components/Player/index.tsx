import React, { useState } from 'react';

import { useHistory } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';

import { IconDictionary, IconMic, IconHistory } from 'assets';

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

function Player() {
  const history = useHistory();

  (window as any).onLoadPlayer = () => {
    unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
    unityContent.send(PLAYER_MANAGER, 'setURL', '');
    unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
  };

  return (
    <div className="player-container">
      <Unity unityContent={unityContent} />
      <div className="player-action-container">
        <IconDictionary color="#939293" />
        <button
          className="player-action-button player-action-button-insert"
          type="button"
        >
          <IconMic color="#FFF" size={24} />
        </button>
        <button
          className="player-action-button player-action-button-microphone"
          type="button"
        >
          <IconMic color="#FFF" size={24} />
        </button>
        <IconHistory color="#939293" size={32} />
      </div>
    </div>
  );
}

export default Player;
