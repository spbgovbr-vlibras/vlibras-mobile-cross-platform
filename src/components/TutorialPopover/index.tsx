import React from 'react';

import './styles.css';

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
}: TutorialPopoverProps) =>
  isEnabled ? (
    <div className="tutorial-popover-container">
      <h1>{title}</h1>
      <h2>{description}</h2>
      <div className={`container__arrow container__arrow--${position}`} />
    </div>
  ) : null;

export default TutorialPopover;
