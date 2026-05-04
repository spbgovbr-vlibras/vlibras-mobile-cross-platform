/* eslint-disable react/button-has-type */
import React from 'react';

import { IconClose } from 'assets';
import './styles.css';
import { CUSTOMIZATION_TUTORIAL_QUEUE, useCustomizationTutorial } from 'hooks/CustomizationTutorial';
import { HOME_TUTORIAL_QUEUE, useHomeTutorial  } from 'hooks/HomeTutorial';

type ArrowPosition =
  | 'tl'
  | 'tc'
  | 'tr'
  | 'bl'
  | 'bc'
  | 'br'
  | 'rt'
  | 'rc'
  | 'rb'
  | 'lt'
  | 'lc'
  | 'lb';

type TutorialContext = 'home' | 'customization';

interface TutorialPopoverProps {
  title: string;
  description: string;
  position: ArrowPosition;
  isEnabled?: boolean;
  context: TutorialContext;
  floatingStyle?: React.CSSProperties;
  arrowStyle?: React.CSSProperties;
  onPrimaryAction?: () => void;
}

const TutorialPopover = ({
  title,
  description,
  position,
  isEnabled = false,
  context,
  floatingStyle,
  arrowStyle,
  onPrimaryAction,
}: TutorialPopoverProps) => {
  const { currentStepIndex, goNextStep, goPreviousStep, onCancel } =
    context === 'home' ? useHomeTutorial() : useCustomizationTutorial();

  const QUEUE = context === 'home' ? HOME_TUTORIAL_QUEUE : CUSTOMIZATION_TUTORIAL_QUEUE;

  return isEnabled ? (
    <div
      className={`tutorial-popover-container tutorial-popover-container--anchor-${position[0]}`}
      style={floatingStyle}>
      <div className="tutorial-row">
        <h1>{title}</h1>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCancel();
          }}>
          <IconClose color="white" size={15} />
        </button>
      </div>
      <h2>{description}</h2>
      <div
        className={`container__arrow container__arrow--${position}`}
        style={arrowStyle}
      />
      <hr />
      <div className="tutorial-row">
        <span>{`${currentStepIndex + 1} de ${QUEUE.length}`}</span>
        <div style={{width:'fit-content', height:'fit-content'}}>
          {currentStepIndex !== 0 && (
            <button
              className="button-outlined-tutorial"
              onClick={(e) => {
                e.stopPropagation();
                goPreviousStep();
              }}>
              Voltar
            </button>
          )}
          <button
            className="button-solid-tutorial"
            onClick={(e) => {
              e.stopPropagation();
              if (onPrimaryAction) {
                onPrimaryAction();
              } else {
                goNextStep();
              }
            }}>
            {currentStepIndex === QUEUE.length - 1 ? 'Fechar' : 'Avançar'}
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
export default TutorialPopover;
