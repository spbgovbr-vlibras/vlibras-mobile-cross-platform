import React, { useEffect, useRef, useState } from 'react';

import { IonPopover, isPlatform } from '@ionic/react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router';
import Unity from 'react-unity-webgl';

import {
  IconDictionary,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconRunning,
  IconPause,
  IconShare,
  IconThumbs,
  IconClose,
  IconIcaro,
  logoRefresh,
  IconHozana,
  logoSubtitleOn,
  logoSubtitleOff,
  IcaroAvatar,
  HozanaAvatar,
  GugaAvatar,
} from 'assets';
import EvaluationModal from 'components/EvaluationModal';
import TutorialPopover from 'components/TutorialPopover';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/customization';
import { Creators as CreatorsVideo } from 'store/ducks/video';

import './styles.css';

type BooleanParamsPlayer = 'True' | 'False';

type Avatar = 'hozana' | 'icaro' | 'guga';

const playerService = PlayerService.getService();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

const X1 = 1;
const X2 = 2;
const X3 = 3;
const UNDEFINED_GLOSS = -1;
const MAX_PROGRESS = 100;

function toBoolean(flag: BooleanParamsPlayer): boolean {
  return flag === 'True';
}

function toInteger(flag: boolean): number {
  return flag ? 1 : 0;
}

function Player() {
  const [popoverState, setShowPopover] = useState({
    showPopover: false,
    event: undefined,
  });
  const history = useHistory();

  const { generateVideo, textGloss } = useTranslation();

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
  const [currentAvatar, setCurrentAvatar] = useState<Avatar>('icaro');
  const [visiblePlayer, setVisiblePlayer] = useState(false);
  const [speedValue, setSpeedValue] = useState(X1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [isShowSubtitle, setIsShowSubtitle] = useState(true);

  // Reference to handle the progress bar [MA]
  const progressBarRef = useRef<HTMLDivElement>(null);
  const progressContainerRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const dispatch = useDispatch();

  let glossLen = UNDEFINED_GLOSS;
  let cache = UNDEFINED_GLOSS;

  // To avoid the unity splash screen [MA]
  useEffect(() => {
    playerService.getUnity().on('progress', (progression: number) => {
      if (progression === 1) {
        dispatch(Creators.loadCustomization.request({}));
        setVisiblePlayer(true);
      }
    });
  }, [dispatch]);

  function handlePlay(gloss: string) {
    if (progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
    }
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
  }

  // Evaluation modal
  const [showModal, setShowModal] = useState(false);
  const [showYesModal, setShowYesModal] = useState(false);
  const [showNoModal, setShowNoModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [showSuggestionFeedbackModal, setShowSuggestionFeedbackModal] =
    useState(false);

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

    if (!toBoolean(_isPlaying)) {
      setHasFinished(true);
    }
  };

  useEffect(() => {
    if (location.pathname === paths.HOME) resetTranslation();
  }, [location]);

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
    dispatch(CreatorsVideo.setProgress(progress));
  };

  function handlePause() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_PAUSE_STATE,
      toInteger(!isPaused),
    );
  }

  function handleSpeed(speed: number) {
    setSpeedValue(speed);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.SET_SLIDER, speed);
    setShowPopover({ showPopover: false, event: undefined });
  }

  function handleChangeAvatar() {
    let nextAvatar: Avatar;

    if (currentAvatar === 'icaro') {
      nextAvatar = 'hozana';
    } else if (currentAvatar === 'hozana') {
      nextAvatar = 'guga';
    } else {
      nextAvatar = 'icaro';
    }

    setCurrentAvatar(nextAvatar);

    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.CHANGE_AVATAR,
      nextAvatar,
    );
  }

  function handleSubtitle() {
    playerService.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_SUBTITLE_STATE,
      toInteger(!isShowSubtitle),
    );
    setIsShowSubtitle(!isShowSubtitle);
  }

  function handleShare() {
    generateVideo();
  }

  function resetTranslation() {
    setHasFinished(false);

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.visibility = 'hidden';
      progressBarRef.current.style.width = '0%';
    }
  }

  const renderPlayerButtons = () => {
    if (isPlaying) {
      return (
        <>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={(e: any) => {
              e.persist();
              setShowPopover({ showPopover: true, event: e });
            }}
          >
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
            {isShowSubtitle ? (
              <img src={logoSubtitleOn} alt="refresh" />
            ) : (
              <img src={logoSubtitleOff} alt="refresh" />
            )}
          </button>
        </>
      );
    }
    if (hasFinished) {
      return (
        <>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={(e: any) => {
              e.persist();
              setShowPopover({ showPopover: true, event: e });
            }}
          >
            <IconRunning color={buttonColors.VARAINT_WHITE} />
          </button>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={() => handlePlay(textGloss)}
          >
            <img src={logoRefresh} alt="refresh" />
          </button>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={handleSubtitle}
          >
            {isShowSubtitle ? (
              <img src={logoSubtitleOn} alt="refresh" />
            ) : (
              <img src={logoSubtitleOff} alt="refresh" />
            )}
          </button>
        </>
      );
    }
    return (
      <>
        <div
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              marginRight: 6,
              position: 'absolute',
              width: '100vw',
              bottom: 50,
              left: -16,
            }}
          >
            <TutorialPopover
              title="Dicionário"
              description="Consulte os sinais disponíveis no vlibras"
              position="bl"
              isEnabled={false}
            />
          </div>
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={() => {
              history.push(paths.DICTIONARY_PLAYER);
              //   setVisiblePlayer(false);
            }}
          >
            <IconDictionary color={buttonColors.VARAINT_WHITE} />
          </button>
        </div>

        <div
          style={{
            position: 'relative',
          }}
        >
          <div
            style={{
              marginRight: 6,
              position: 'absolute',
              width: '100vw',
              bottom: 54,
              left: -40,
            }}
          >
            <TutorialPopover
              title="Dicionário"
              description="Consulte os sinais disponíveis no vlibras"
              position="bc"
              isEnabled={false}
            />
          </div>
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={() => history.push(paths.TRANSLATOR)}
          >
            <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        </div>

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

  useEffect(() => {
    const preProcessingPreview = JSON.stringify({
      corpo: currentBody,
      olhos: '#fffafa',
      cabelo: currentHair,
      camisa: currentShirt,
      calca: currentPants,
      iris: currentEye,
      pos: 'center',
    });
    console.log(preProcessingPreview);
    playerService.send(
      PlayerKeys.AVATAR,
      PlayerKeys.SETEDITOR,
      preProcessingPreview,
    );
  }, [currentBody, currentHair, currentShirt, currentPants, currentEye]);

  return (
    <div className="player-container">
      <IonPopover
        cssClass="player-popover"
        event={popoverState.event}
        isOpen={popoverState.showPopover}
        onDidDismiss={() =>
          setShowPopover({ showPopover: false, event: undefined })
        }
      >
        <div className="player-popover-content">
          <button
            className={
              speedValue === X3
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X3)}
          >
            <span>X3</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X2
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X2)}
          >
            <span>X2</span>
          </button>
          <div className="player-popover-content-divider" />
          <button
            className={
              speedValue === X1
                ? 'player-popover-content-item-active'
                : 'player-popover-content-item-none'
            }
            type="button"
            onClick={() => handleSpeed(X1)}
          >
            <span>X1</span>
          </button>
        </div>
      </IonPopover>
      <div className="player-container-button">
        {isPlaying || hasFinished ? (
          <button
            className="player-button-rounded-top"
            type="button"
            onClick={resetTranslation}
          >
            <IconClose color="#FFF" size={24} />
          </button>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ marginRight: 6 }}>
              <TutorialPopover
                title="Trocar avatar"
                description="Alterne entre os avatares disponíveis"
                position="rb"
                isEnabled={false}
              />
            </div>
            <button
              className="player-button-avatar-rounded-top"
              type="button"
              onClick={handleChangeAvatar}
            >
              {currentAvatar === 'icaro' && <HozanaAvatar />}
              {currentAvatar === 'hozana' && <GugaAvatar />}
              {currentAvatar === 'guga' && <IcaroAvatar />}
            </button>
          </div>
        )}
      </div>
      <div
        style={{
          width: '100vw',
          zIndex: 0,
          flexShrink: 0,
          marginBottom: 70,
          flex: 1,
          display: 'flex',
          background: isPlatform('ios') && visiblePlayer ? 'black' : '#E5E5E5',
        }}
      >
        <Unity
          unityContent={playerService.getUnity()}
          className="player-content"
        />
      </div>

      {hasFinished && !isPlaying && (
        <div className="player-container-buttons">
          <button
            className="player-button-rounded"
            type="button"
            onClick={() => setShowModal(true)}
          >
            <IconThumbs color="#FFF" size={18} />
          </button>
          <button
            className="player-button-rounded"
            type="button"
            onClick={handleShare}
          >
            <IconShare color="#FFF" size={18} />
          </button>
        </div>
      )}
      <div className="player-action-container">
        <div ref={progressContainerRef} className="player-progress-container">
          <div ref={progressBarRef} className="player-progress-bar" />
        </div>
        <div className="play-action-content">{renderPlayerButtons()}</div>
      </div>

      <EvaluationModal
        show={showModal}
        setShow={setShowModal}
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
}

export default Player;
