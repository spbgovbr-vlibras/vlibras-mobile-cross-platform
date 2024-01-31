import React from 'react';
import { useHistory } from 'react-router';

import {
  IconDictionary,
  IconHistory,
  IconEdit,
  IconPauseOutlined,
  IconRunning,
  IconPause,
  logoRefresh,
  logoSubtitleOn,
  logoSubtitleOff,
  IconSubtitle,
  IconRefresh,
} from 'assets';
import TutorialPopover from 'components/TutorialPopover';
import paths from 'constants/paths';
import { TutorialSteps } from 'hooks/Tutorial';
import './styles.css';

interface PlayerControlsProps {
  isPlaying: boolean;
  hasFinished: boolean;
  isPaused: boolean;
  isShowSubtitle: boolean;
  currentStep: TutorialSteps;
  textGloss?: string;
  setShowPopover: (value: {
    showPopover: boolean;
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>;
  }) => void;
  handlePause: () => void;
  handlePlay: (textGloss: string) => void;
  handleSubtitle: () => void;
  onCancel: () => void;
  // Add other props here
}

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARIANT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

const PlayerControls: React.FC<PlayerControlsProps> = ({
  isPlaying,
  isPaused,
  isShowSubtitle,
  handlePause,
  handleSubtitle,
  setShowPopover,
  handlePlay,
  textGloss,
  hasFinished,
  currentStep,
  onCancel,
}) => {
  const history = useHistory();

  const renderPlayingButtons = () => (
    <>
      <button
        className="player-action-button-transparent"
        type="button"
        onClick={(e) => {
          e.persist();
          setShowPopover({ showPopover: true, event: e });
        }}>
        <IconRunning color={buttonColors.VARIANT_WHITE} />
      </button>
      <button
        className="player-action-button player-action-button-insert"
        type="button"
        onClick={handlePause}>
        {isPaused ? (
          <IconPauseOutlined color={buttonColors.VARIANT_BLUE} size={24} />
        ) : (
          <IconPause color={buttonColors.VARIANT_BLUE} size={24} />
        )}
      </button>
      <button
        className="player-action-button-transparent"
        type="button"
        onClick={handleSubtitle}>
        <img
          src={isShowSubtitle ? logoSubtitleOn : logoSubtitleOff}
          alt="subtitle toggle"
        />
      </button>
    </>
  );

  const renderFinishedButtons = () => (
    <>
      <button
        className="player-action-button-transparent"
        type="button"
        onClick={(e) => {
          e.persist();
          setShowPopover({ showPopover: true, event: e });
        }}>
        <IconRunning color={buttonColors.VARIANT_WHITE} />
      </button>
      <button
        className="player-action-button player-action-button-insert"
        type="button"
        onClick={() => textGloss && handlePlay(textGloss)}>
        <img src={logoRefresh} alt="refresh" />
      </button>
      <button
        className="player-action-button-transparent"
        type="button"
        onClick={handleSubtitle}>
        <img
          src={isShowSubtitle ? logoSubtitleOn : logoSubtitleOff}
          alt="subtitle toggle"
        />
      </button>
    </>
  );

  const renderDefaultButtons = () => {
    return (
      <>
        <div
          style={{
            position: 'relative',
          }}>
          <div
            style={{
              marginRight: 6,
              position: 'absolute',
              width: '100vw',
              bottom: 50,
              left: 0,
            }}>
            <TutorialPopover
              title="Dicionário"
              description="Consulte os sinais disponíveis no vlibras"
              position="bl"
              isEnabled={currentStep === TutorialSteps.DICTIONARY}
            />
          </div>
          {currentStep >= TutorialSteps.CLOSE &&
          currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
            <IconRunning color={buttonColors.VARIANT_WHITE} size={32} />
          ) : (
            <button
              className="player-action-button-transparent"
              type="button"
              onClick={() => {
                history.push(paths.DICTIONARY_PLAYER);
                onCancel();
              }}>
              <IconDictionary color={buttonColors.VARIANT_WHITE} />
            </button>
          )}
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 0,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Tradução PT-BR"
              description="Escreva ou cole o texto para ser traduzido"
              position="bc"
              isEnabled={currentStep === TutorialSteps.TRANSLATION}
            />
          </div>
        </div>
        {currentStep >= TutorialSteps.CLOSE &&
        currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
          <button
            className="player-action-button player-action-button-insert"
            type="button">
            <IconRefresh color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        ) : (
          <button
            className="player-action-button player-action-button-insert"
            type="button"
            onClick={() => {
              history.push(paths.TRANSLATOR);
              onCancel();
            }}>
            <IconEdit color={buttonColors.VARIANT_BLUE} size={24} />
          </button>
        )}

        <div
          style={{
            margin: 'auto',
            position: 'absolute',
            bottom: 70,
            left: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
          }}>
          <TutorialPopover
            title="Repetir tradução"
            description="Repita a última tradução feita"
            position="bc"
            isEnabled={currentStep === TutorialSteps.REPEAT}
          />
        </div>

        <div
          style={{
            margin: 'auto',
            position: 'absolute',
            bottom: 60,
            left: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100vw',
            paddingRight: '28px',
          }}>
          <TutorialPopover
            title="Histórico"
            description="Acesse as traduções dos últimos 30 dias"
            position="br"
            isEnabled={currentStep === TutorialSteps.HISTORY}
          />
        </div>
        {currentStep >= TutorialSteps.CLOSE &&
        currentStep <= TutorialSteps.PLAYBACK_SPEED ? (
          <IconSubtitle color={buttonColors.VARIANT_WHITE} size={32} />
        ) : (
          <button
            className="player-action-button-transparent"
            type="button"
            onClick={() => {
              history.push(paths.HISTORY);
              onCancel();
            }}>
            <IconHistory color={buttonColors.VARIANT_WHITE} size={32} />
          </button>
        )}

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Legenda"
              description="Habilite legenda para tradução"
              position="br"
              isEnabled={currentStep === TutorialSteps.SUBTITLE}
            />
          </div>
        </div>

        <div>
          <div
            style={{
              margin: 'auto',
              position: 'absolute',
              bottom: 70,
              left: 10,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100vw',
            }}>
            <TutorialPopover
              title="Velocidade de reprodução"
              description="Altere a velocidade de reprodução"
              position="bl"
              isEnabled={currentStep === TutorialSteps.PLAYBACK_SPEED}
            />
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      {isPlaying && renderPlayingButtons()}
      {hasFinished && renderFinishedButtons()}
      {!isPlaying && !hasFinished && renderDefaultButtons()}
    </>
  );
};

export default PlayerControls;
