import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSelector } from 'react-redux';
import Unity from 'react-unity-webgl';

import RegionalismArray from 'data/regionalism';
import PlayerService from 'services/unity';
import { RootState } from 'store';
import { UNITY_DICT_HOST_ID } from 'utils/unityCanvasDock';

import './styles.css';

const playerService = PlayerService.getPlayerInstance();

/**
 * Na Home o Unity fica no Player. Aqui só gerenciamos o canvas quando ele
 * precisa sair da Home: mini player (portal) ou off-screen (hidden).
 */
function GlobalPlayerCanvas() {
  const { mode } = useSelector((s: RootState) => s.playerCanvas);
  const currentRegionalism = useSelector(({ regionalism }: RootState) => regionalism.current);
  const hiddenHostRef = useRef<HTMLDivElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  const managesUnity = mode === 'dict-mini' || mode === 'hidden';

  useEffect(() => {
    if (!managesUnity) {
      setPortalTarget(null);
      return undefined;
    }

    playerService.load(
      RegionalismArray.find((item) => item.name === currentRegionalism.name)
        ?.abbreviation ?? ''
    );
  }, [managesUnity, currentRegionalism.name]);

  useEffect(() => {
    if (!managesUnity) {
      setPortalTarget(null);
      return undefined;
    }

    if (mode === 'hidden') {
      setPortalTarget(hiddenHostRef.current);
      return undefined;
    }

    let cancelled = false;
    const attach = () => {
      if (cancelled) return;
      const host = document.getElementById(UNITY_DICT_HOST_ID);
      if (host) setPortalTarget(host);
    };

    attach();
    const observer = new MutationObserver(attach);
    observer.observe(document.body, { childList: true, subtree: true });
    const poll = window.setInterval(attach, 200);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearInterval(poll);
    };
  }, [mode, managesUnity]);

  useEffect(() => {
    if (managesUnity && portalTarget) {
      window.dispatchEvent(new Event('resize'));
    }
  }, [managesUnity, portalTarget]);

  const unity = (
    <Unity
      unityContent={playerService.getUnity()}
      className="global-player-canvas-unity"
    />
  );

  return (
    <>
      <div
        ref={hiddenHostRef}
        className="global-player-canvas global-player-canvas--hidden"
        aria-hidden
      />
      {managesUnity && portalTarget ? createPortal(unity, portalTarget) : null}
    </>
  );
}

export default GlobalPlayerCanvas;
