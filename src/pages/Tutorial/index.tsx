import React from 'react';

import { IonContent, IonImg, IonText, IonToggle } from '@ionic/react';

import { IconTutorial, logoYoutube, IconLeftArrow } from '../../assets';
import { Strings } from './strings';

import './styles.css';

function Tutorial() {
  return (
    <IonContent>
      <div className="tutorial-container">
        <div className="tutorial-header">
          <IconLeftArrow></IconLeftArrow>
          <IonText class="tutorial-header-text">
            {Strings.TOOLBAR_TITLE}
          </IonText>
        </div>
        <div className="tutorial-tip-container">
          <IonText class="tutorial-tip-text">{Strings.DICAS_APP}</IonText>
          <IonToggle class="tutorial-toggle"></IonToggle>
        </div>
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
          <IonImg src={logoYoutube} class="tutorial-youtube-logo"></IonImg>
        </div>
      </div>
    </IonContent>
  );
}

export default Tutorial;
