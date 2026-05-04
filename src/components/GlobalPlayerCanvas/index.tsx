import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import Unity from 'react-unity-webgl';

import RegionalismArray from 'data/regionalism';
import PlayerService from 'services/unity';
import { RootState } from 'store';

import './styles.css';

const playerService = PlayerService.getPlayerInstance();

/**
 * Unity compartilhado quando `playerCanvas.mode` é `home` ou `dict-mini`.
 * Em `hidden`, o Player local monta o Unity (fluxo atual da Home).
 */
function GlobalPlayerCanvas() {
  const mode = useSelector((s: RootState) => s.playerCanvas.mode);
  const currentRegionalism = useSelector(({ regionalism }: RootState) => regionalism.current);

  useEffect(() => {
    if (mode === 'hidden') return;
    playerService.load(
      RegionalismArray.find((item) => item.name === currentRegionalism.name)
        ?.abbreviation ?? ''
    );
  }, [mode, currentRegionalism.name]);

  if (mode === 'hidden') {
    return null;
  }

  return (
    <div className={`global-player-canvas global-player-canvas--${mode}`}>
      <Unity
        unityContent={playerService.getUnity()}
        className="global-player-canvas-unity"
      />
    </div>
  );
}

export default GlobalPlayerCanvas;
