import React from 'react';

import { IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

import { DrawerMenu } from '../components';
import paths from '../constants/paths';
import { About, Home, Historic, Dictionary } from '../pages';

const CONTENT_ID = '@vlibras/mobile';

function Routes() {
  return (
    <>
      <DrawerMenu contentId={CONTENT_ID} />
      <IonRouterOutlet id={CONTENT_ID}>
        <IonReactRouter>
          <Route exact component={Home} path={paths.HOME} />
          <Route exact component={Historic} path={paths.HISTORY} />
          <Route exact component={About} path={paths.ABOUT} />
          <Route exact component={Dictionary} path={paths.DICTIONARY} />
        </IonReactRouter>
      </IonRouterOutlet>
    </>
  );
}

export default Routes;
