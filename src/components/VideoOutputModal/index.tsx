import React, { useEffect, useState } from 'react';
import { IonModal, IonButton } from '@ionic/react';
import { logoPlay, logoClose, cameraBlue, logoAnswer } from '../../assets';
import './styles.css';
import Player from 'components/Player';
import { Creators } from 'store/ducks/video';
import { useDispatch } from 'react-redux';
import {  Types } from 'store/ducks/customization';


import PlayerService from 'services/unity';
import Unity, { UnityContent } from 'react-unity-webgl';
import paths from 'constants/paths';
import { useHistory, useLocation } from 'react-router-dom';
import { PlayerKeys } from 'constants/player';
import { current } from 'immer';
import { Customization } from 'pages';
import { types } from 'util';


const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';
const PLAYER_MANAGER = 'PlayerManager';

interface VideoOutputModalProps {
  outputs: any;
  showButtons: boolean;
  showModal: boolean;
  setShowModal: any;
  playerIntermedium: boolean;
}

const unityContent = new UnityContent(
  'Build-Final/Build/NOVABUILD.json',
  'Build-Final/Build/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

export interface CustomizationState {
  currentbody: string;
  currenteye: string;
  currenthair: string;
  currentpants: string;
  currentshirt: string;
}


const VideoOutputModal = ({
  outputs,
  showButtons,
  setShowModal,
  showModal,
  playerIntermedium,
}: VideoOutputModalProps) => {
  const [openPlayer, setOpenPlayer] = useState(playerIntermedium);
  const dispatch = useDispatch();
  const history = useHistory();

  const closeModal = () => {
    setShowModal(false);
    dispatch(Creators.setCurrentArrayVideo([]));
  };

  const playWord = (value: string) => {
    if (openPlayer) {
      unityContent.send(PLAYER_MANAGER, 'playNow', value);
    }
  };

  const renderOutputs = () => {
    return outputs.map((item: string, key: string) => (
      <span onClick={() => playWord(item)} key={key}>
        {item}
      </span>
    ));
  };

  (window as any).onLoadPlayer = () => {
    unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
    unityContent.send(PLAYER_MANAGER, 'setURL', '');
    unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
    unityContent.send(PLAYER_MANAGER, 'playNow', outputs.join(' '));
    unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', 0);
  };

  useEffect(() => {
    if (showModal) {
      unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
      unityContent.send(PLAYER_MANAGER, 'setURL', '');
      unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
      unityContent.send(PLAYER_MANAGER, 'playNow', outputs.join(' '));
      unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', 0);
      
    }
  }, [outputs, showModal]);

  return (
    <>
      <IonModal
        isOpen={showModal}
        cssClass={
          'videooutput-modal' +
          (openPlayer ? ' player' : '') +
          (!showButtons ? ' buttons-off' : '')
        }
        swipeToClose={true}
        onDidDismiss={closeModal}
      >
        <div className="modal-title">
          <span> Resultado tradução </span>
          {!openPlayer ? (
            <img src={logoPlay} onClick={() => setOpenPlayer(true)}></img>
          ) : (
            <img src={logoClose} onClick={closeModal}></img>
          )}
        </div>
        <div className="list-outputs">
          <div className="container-outputs">{renderOutputs()}</div>
        </div>
        {openPlayer && (
          <div className="player">
            <Unity
              unityContent={unityContent}
              className="player-video-output"
            />
          </div>
        )}
        {showButtons && (
          <div className="list-buttons">
            <IonButton
              className="answer-button"
              onClick={() => {
                setShowModal(false);
                history.push(paths.TRANSLATOR);
              }}
            >
              <img className="answer-button-logo" src={logoAnswer}></img>
              Responder
            </IonButton>
            <IonButton className="newsign-button" onClick={closeModal}>
              <img className="logo-union" src={cameraBlue}></img> Novo Sinal
            </IonButton>
          </div>
        )}
      </IonModal>
    </>
  );
};

export default VideoOutputModal;
