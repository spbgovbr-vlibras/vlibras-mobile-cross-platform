import React from 'react';

import { ArrowLeft } from 'assets';
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
  const { currentStepIndex, goNextStep } = useTutorial();

  return isEnabled ? (
    <div className="tutorial-popover-container">
      <div className="tutorial-row">
        <div>
          <h1>{title}</h1>
          <h2>{description}</h2>
        </div>
        <div className="tutorial-column">
          <button onClick={goNextStep}>
            <ArrowLeft />
          </button>
          <span>{`${currentStepIndex + 1}/${TUTORIAL_QUEUE.length}`}</span>
        </div>
      </div>
      <div className={`container__arrow container__arrow--${position}`} />
    </div>
  ) : null;
};
export default TutorialPopover;
