import { IonButton, IonContent, IonText } from '@ionic/react';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { IconYoutube } from 'assets';
import paths from 'constants/paths';
import { useHomeTutorial } from 'hooks/HomeTutorial';
import { MenuLayout } from 'layouts';

import { Strings } from './strings';

import './styles.css';

function Tutorial() {
  const history = useHistory();
  const { restartGuidedTour } = useHomeTutorial();

  function handleRestartTour() {
    restartGuidedTour();
    history.push(paths.HOME);
  }

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode="back">
      <IonContent>
        <div className="tutorial-container">
          <div className="tutorial-text-container">
            <IonText className="tutorial-texts-1">
              {Strings.SEND_MESSAGE_1}
            </IonText>
            <h1 className="tutorial-texts-2">
              {Strings.SEND_MESSAGE_2}
              <br />
              <span className="tutorial-texts-3">{Strings.SEND_MESSAGE_3}</span>
              <a href="https://www.gov.br/governodigital/pt-br/vlibras/">
                {Strings.SEND_MESSAGE_4}
              </a>
            </h1>
            <IonText className="tutorial-texts-4">{Strings.FOLLOW_STEPS}</IonText>
            <a href="https://www.youtube.com/channel/UCF94lq7TwAu5OmlwIu44qpA">
              <IconYoutube color="#939293" />
            </a>
          </div>
        </div>
        <div className="tutorial-restart-wrap">
          <IonButton
            expand="block"
            fill="solid"
            className="tutorial-restart-button"
            onClick={handleRestartTour}>
            {Strings.RESTART_GUIDED_TOUR}
          </IonButton>
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Tutorial;
