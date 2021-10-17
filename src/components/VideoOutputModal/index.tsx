import React, {
  useRef,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from 'react';

import { IonModal, IonButton } from '@ionic/react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';
import { v4 as uuidv4 } from 'uuid';

import { IconCloseCircle, IconCamera, IconEdit, IconPlay } from 'assets';
import paths from 'constants/paths';
import { Creators } from 'store/ducks/video';
import './styles.css';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';
const PLAYER_MANAGER = 'PlayerManager';

interface VideoOutputModalProps {
  outputs: string[];
  showButtons: boolean;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  playerIntermedium: boolean;
}

const unityContent = new UnityContent(
  'BUILD/Build/BUILD.json',
  'BUILD/Build/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

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
  const location = useLocation();

  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const MAX_PROGRESS = 100;
  const UNDEFINED_GLOSS = -1;

  let cache = UNDEFINED_GLOSS;
  let glossLen = UNDEFINED_GLOSS;

  const closeModal = () => {
    setShowModal(false);
    dispatch(Creators.setCurrentArrayVideo([]));

    if (location.pathname === paths.RECORDERAREA) {
      setOpenPlayer(false);
    }
  };

  const progressHandle = (): void => {
    if (progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
    }
  };

  const cleanProgress = (): void => {
    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.width = '0%';
    }
  };

  const playWord = (value: string) => {
    if (openPlayer) {
      cleanProgress();
      progressHandle();
      unityContent.send(PLAYER_MANAGER, 'playNow', value);
    }
  };

  const renderOutputs = () => {
    return outputs.map((item: string) => (
      <button onClick={() => playWord(item)} key={uuidv4()} type="button">
        {item}
      </button>
    ));
  };

  (window as any).onLoadPlayer = () => {
    // cleanProgress();
    progressHandle();
    unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
    unityContent.send(PLAYER_MANAGER, 'setURL', '');
    unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
    unityContent.send(PLAYER_MANAGER, 'playNow', outputs.join(' '));
    unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', 0);
  };

  useEffect(() => {
    if (showModal) {
      // cleanProgress();
      progressHandle();
      unityContent.send(PLAYER_MANAGER, 'initRandomAnimationsProcess');
      unityContent.send(PLAYER_MANAGER, 'setURL', '');
      unityContent.send(PLAYER_MANAGER, 'setBaseUrl', DICTIONAY_URL);
      unityContent.send(PLAYER_MANAGER, 'playNow', outputs.join(' '));
      unityContent.send(PLAYER_MANAGER, 'setSubtitlesState', 0);
    }
  }, [outputs, showModal]);

  window.CounterGloss = (counter: number, glossLength: number) => {
    if (counter === cache - 1) {
      glossLen = counter;
    }
    cache = counter;

    const progress = (1 / glossLen) * 100;

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = `${
        progress > MAX_PROGRESS ? MAX_PROGRESS : progress
      }%`;
    }
  };

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
              <IconPlay />
            </button>
          ) : (
            <button
              className="videooutput-modal-button-none"
              onClick={closeModal}
              type="button"
            >
              <IconCloseCircle color="#1447A6" />
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
            <div
              ref={progressContainerRef}
              className="player-progress-container-video"
            >
              <div ref={progressBarRef} className="player-progress-bar-video" />
            </div>
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
              <IconEdit />
              Responder
            </IonButton>
            <IonButton className="newsign-button" onClick={closeModal}>
              <IconCamera /> Novo Sinal
            </IonButton>
          </div>
        )}
      </IonModal>
    </>
  );
};

export default VideoOutputModal;
