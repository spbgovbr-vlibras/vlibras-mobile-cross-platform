import React from 'react';

import { IonText, IonToggle, IonItem, IonLabel } from '@ionic/react';

import { IconYoutube } from 'assets';
import { useTutorial } from 'hooks/Tutorial';
import { MenuLayout } from 'layouts';

import { Strings } from './strings';

import './styles.css';

function Tutorial() {
  const { alwaysShowTutorial, setAlwaysShowTutorial } = useTutorial();
  return (
    <MenuLayout title="Central de ajuda" mode="back">
      <IonItem>
        <IonLabel>{Strings.ALWAYS_SEE_TUTORIAL}</IonLabel>
        <IonToggle
          checked={alwaysShowTutorial}
          onIonChange={e => setAlwaysShowTutorial(e.detail.checked)}
        />
      </IonItem>
      <div className="tutorial-container">
        <div className="tutorial-text-container">
          <IonText class="tutorial-texts-1">{Strings.SEND_MESSAGE_1}</IonText>
          <h1 className="tutorial-texts-2">
            {Strings.SEND_MESSAGE_2}
            <br />
            <span className="tutorial-texts-3">{Strings.SEND_MESSAGE_3}</span>
            <a href="https://www.gov.br/governodigital/pt-br/vlibras/">
              {Strings.SEND_MESSAGE_4}
            </a>
          </h1>
          <IonText class="tutorial-texts-4">{Strings.FOLLOW_STEPS}</IonText>
          <a href="https://www.youtube.com/channel/UCF94lq7TwAu5OmlwIu44qpA">
            <IconYoutube color="#939293" />
          </a>
        </div>
      </div>
    </MenuLayout>
  );
}

export default Tutorial;
