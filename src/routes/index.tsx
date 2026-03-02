import { App } from '@capacitor/app';
import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';
import Unity from 'react-unity-webgl';

import { DrawerMenu } from 'components';
import PlayerService from 'services/unity';

import paths from '../constants/paths';
import {
  About,
  Home,
  Historic,
  Dictionary,
  Regionalism,
  Translator,
  Domain,
  OnBoarding,
  SignalCapture,
  RecorderArea,
  Customization,
  Tutorial,
} from '../pages';

const CONTENT_ID = '@vlibras/mobile';
const playerService = PlayerService.getPlayerInstance();

function Routes() {
  document.addEventListener('ionBackButton', (ev: any) => {
    ev.detail.register(-1, () => {
      if (window.location.pathname === '/') {
        App.exitApp();
      }
    });
  });

  return (
    <BrowserRouter>
      <IonReactRouter>
        <div
          id="persistent-unity-container"
          style={{
            position: 'fixed',
            left: '-200vw',
            top: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
          }}
        >
          <Unity
            unityContent={playerService.getUnity()}
            className="player-content"
          />
        </div>
        <DrawerMenu contentId={CONTENT_ID} />
        <IonRouterOutlet id={CONTENT_ID}>
          <Route exact component={Home} path={paths.HOME} />
          <Route component={Historic} path={paths.HISTORY} />
          <Route component={About} path={paths.ABOUT} />
          <Route component={Dictionary} path={paths.DICTIONARY} />
          <Route component={Regionalism} path={paths.REGIONALISM} />
          <Route component={Translator} path={paths.TRANSLATOR} />
          <Route component={RecorderArea} path={paths.RECORDERAREA} />
          <Route component={Domain} path={paths.DOMAIN} />
          <Route component={OnBoarding} path={paths.ONBOARDING} />
          <Route component={Customization} path={paths.CUSTOMIZATION} />
          <Route component={SignalCapture} path={paths.SIGNALCAPTURE} />
          <Route component={Dictionary} path={paths.DICTIONARY_PLAYER} />
          <Route component={Tutorial} path={paths.TUTORIAL} />
        </IonRouterOutlet>
      </IonReactRouter>
    </BrowserRouter>
  );
}

export default Routes;
