import React from 'react';
import Unity from 'react-unity-webgl';

import UnityService from 'services/unity';

const playerService = UnityService.getPlayerInstance();

/**
 * Monta o Unity uma única vez. Re-renders do Player (progresso, tradução, etc.)
 * não devem remontar o WebGL — isso quebrava o avatar após traduções no mini player.
 */
const StableUnityPlayer = React.memo(
  function StableUnityPlayer() {
    return (
      <Unity
        unityContent={playerService.getUnity()}
        className="player-content"
      />
    );
  },
  () => true
);

export default StableUnityPlayer;
