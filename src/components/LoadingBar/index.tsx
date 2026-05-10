import React, { useRef } from 'react';

import { useOnCounterGloss } from 'hooks/unityHooks';

interface loadingBarProps {
  className: any;
  progressBarRef: any;
  progressContainerRef: any;
}

const LoadingBar = ({
  className,
  progressBarRef,
  progressContainerRef,
}: loadingBarProps) => {
  useOnCounterGloss((counter: number, glossLength: number) => {
    const progress =
      glossLength > 0
        ? Math.min(100, Math.max(0, (counter / glossLength) * 100))
        : 0;

    if (progressBarRef.current && progressContainerRef.current) {
      progressContainerRef.current.style.visibility = 'visible';
      progressBarRef.current.style.visibility = 'visible';
      progressBarRef.current.style.width = `${progress}%`;
    }
  }, []);

  return (
    <div ref={progressContainerRef} className={className.container}>
      <div ref={progressBarRef} className={className.bar} />
    </div>
  );
};

export default LoadingBar;
