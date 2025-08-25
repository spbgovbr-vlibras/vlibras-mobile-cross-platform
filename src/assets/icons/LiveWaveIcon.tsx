import React from 'react';

const LiveWaveIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="#2365DE">
    <rect x="2" y="10" width="3" height="8">
      <animate
        attributeName="height"
        values="8;24;8"
        dur="1.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="10;2;10"
        dur="1.2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="8" y="10" width="3" height="8">
      <animate
        attributeName="height"
        values="8;24;8"
        dur="1.2s"
        begin="0.2s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="10;2;10"
        dur="1.2s"
        begin="0.2s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="14" y="10" width="3" height="8">
      <animate
        attributeName="height"
        values="8;24;8"
        dur="1.2s"
        begin="0.4s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="10;2;10"
        dur="1.2s"
        begin="0.4s"
        repeatCount="indefinite"
      />
    </rect>
    <rect x="20" y="10" width="3" height="8">
      <animate
        attributeName="height"
        values="8;24;8"
        dur="1.2s"
        begin="0.6s"
        repeatCount="indefinite"
      />
      <animate
        attributeName="y"
        values="10;2;10"
        dur="1.2s"
        begin="0.6s"
        repeatCount="indefinite"
      />
    </rect>
  </svg>
);

export default LiveWaveIcon;
