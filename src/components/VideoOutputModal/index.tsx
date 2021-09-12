import React, { useEffect, useState } from 'react';

import { IonModal, IonButton } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';
import { v4 as uuidv4 } from 'uuid';

import { logoPlay, logoClose, logoMaos, logoAnswer } from 'assets';
import paths from 'constants/paths';
import { Creators } from 'store/ducks/video';
import './styles.css';

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
      <button
        className="videooutput-modal-button-none"
        onClick={() => playWord(item)}
        key={uuidv4()}
        type="button"
      >
        {item}
      </button>
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
        cssClass={`videooutput-modal${openPlayer ? ' player' : ''}${
          !showButtons ? ' buttons-off' : ''
        }`}
        swipeToClose
        onDidDismiss={closeModal}
      >
        <div className="modal-title">
          <span> Resultado tradução </span>
          {!openPlayer ? (
            <button
              className="videooutput-modal-button-none"
              onClick={() => setOpenPlayer(true)}
              type="button"
            >
              <img src={logoPlay} alt="Logo Play" />
            </button>
          ) : (
            <button
              className="videooutput-modal-button-none"
              onClick={closeModal}
              type="button"
            >
              <img src={logoClose} alt="Logo Fechar" />
            </button>
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
              <img src={logoAnswer} alt="Logo" />
              Responder
            </IonButton>
            <IonButton className="newsign-button" onClick={closeModal}>
              <img className="logo-union" src={logoMaos} alt="Logo" /> Novo
              Sinal
            </IonButton>
          </div>
        )}
      </IonModal>
    </>
  );
};

export default VideoOutputModal;
