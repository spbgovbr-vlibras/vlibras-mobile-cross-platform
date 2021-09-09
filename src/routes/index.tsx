import React from 'react';

import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { BrowserRouter, Route } from 'react-router-dom';

import { DrawerMenu } from 'components';

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
  Tutorial,
} from '../pages';

const CONTENT_ID = '@vlibras/mobile';

function Routes() {
  return (
    <BrowserRouter>
      <IonReactRouter>
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
          <Route component={SignalCapture} path={paths.SIGNALCAPTURE} />
          <Route component={Tutorial} path={paths.TUTORIAL} />

        </IonRouterOutlet>
      </IonReactRouter>
    </BrowserRouter>
  );
}

export default Routes;
