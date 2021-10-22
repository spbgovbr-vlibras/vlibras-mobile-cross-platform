import React, { useRef } from 'react';

interface loadingBarProps {
  className: any;
  progressBarRef: any;
  progressContainerRef: any;
}

const UNDEFINED_GLOSS = -1;
const MAX_PROGRESS = 100;

const LoadingBar = ({
  className,
  progressBarRef,
  progressContainerRef,
}: loadingBarProps) => {
  let glossLen = UNDEFINED_GLOSS;
  let cache = UNDEFINED_GLOSS;

  window.CounterGloss = (counter: number, glossLength: number) => {
    if (counter === cache - 1) {
      glossLen = counter;
    }
    cache = counter;

    const progress = (1 / glossLen) * 100;

    console.log(progressBarRef.current, className);

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = `${
        progress > MAX_PROGRESS ? MAX_PROGRESS : progress
      }%`;
    }
  };

  return (
    <div ref={progressContainerRef} className={className.container}>
      <div ref={progressBarRef} className={className.bar} />
    </div>
  );
};

export default LoadingBar;
