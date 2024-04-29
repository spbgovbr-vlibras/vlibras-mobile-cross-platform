/* eslint-disable react/button-has-type */
import React from 'react';

import { IconClose } from 'assets';
import './styles.css';
import { TUTORIAL_QUEUE, useTutorial } from 'hooks/Tutorial';

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

interface TutorialPopoverProps {
  title: string;
  description: string;
  position: ArrowPosition;
  isEnabled?: boolean;
}

const TutorialPopover = ({
  title,
  description,
  position,
  isEnabled = false,
}: TutorialPopoverProps) => {
  const { currentStepIndex, goNextStep, goPreviousStep, onCancel } =
    useTutorial();

  return isEnabled ? (
    <div className="tutorial-popover-container">
      <div className="tutorial-row">
        <h1>{title}</h1>
        <button onClick={onCancel}>
          <IconClose color="white" size={15} />
        </button>
      </div>
      <h2>{description}</h2>
      <div className={`container__arrow container__arrow--${position}`} />
      <hr />
      <div className="tutorial-row">
        <span>{`${currentStepIndex + 1} de ${TUTORIAL_QUEUE.length}`}</span>
        <div>
          {currentStepIndex != 0 && (
            <button
              className="button-outlined-tutorial"
              onClick={goPreviousStep}>
              Voltar
            </button>
          )}
          <button className="button-solid-tutorial" onClick={goNextStep}>
            Avançar
          </button>
        </div>
      </div>
    </div>
  ) : null;
};
export default TutorialPopover;
