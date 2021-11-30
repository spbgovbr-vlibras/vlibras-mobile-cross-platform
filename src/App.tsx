import React, { useEffect } from 'react';

import { IonApp, setupConfig } from '@ionic/react';
import { Provider } from 'react-redux';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { TranslationProvider } from 'hooks/Translation';
import { TutorialProvider } from 'hooks/Tutorial';

import Routes from './routes';
import PlayerService from './services/unity';
import store from './store';

setupConfig({
  animated: true,
});

const playerService = PlayerService.getService();

function App() {
  useEffect(() => {
    playerService.load();
  }, []);

  return (
    <IonApp>
      <Provider store={store}>
        <TranslationProvider>
          <TutorialProvider>
            <Routes />
          </TutorialProvider>
        </TranslationProvider>
      </Provider>
    </IonApp>
  );
}

export default App;
