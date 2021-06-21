import React from 'react';

import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

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
} from '../pages';

const CONTENT_ID = '@vlibras/mobile';

function Routes() {
  return (
    <>
      <DrawerMenu contentId={CONTENT_ID} />
      <IonReactRouter>
        <IonRouterOutlet id={CONTENT_ID}>
          <Route exact component={Home} path={paths.HOME} />
          <Route exact component={Historic} path={paths.HISTORY} />
          <Route exact component={About} path={paths.ABOUT} />
          <Route exact component={Dictionary} path={paths.DICTIONARY} />
          <Route exact component={Regionalism} path={paths.REGIONALISM} />
          <Route exact component={Translator} path={paths.TRANSLATOR} />
          <Route exact component={RecorderArea} path={paths.RECORDERAREA} />
          <Route exact component={Domain} path={paths.DOMAIN} />
          <Route exact component={OnBoarding} path={paths.ONBOARDING} />
          <Route exact component={SignalCapture} path={paths.SIGNALCAPTURE} />
        </IonRouterOutlet>
      </IonReactRouter>
    </>
  );
}

export default Routes;
