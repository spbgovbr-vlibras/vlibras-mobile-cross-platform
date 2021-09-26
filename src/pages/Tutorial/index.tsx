import React from 'react';

import { IonText } from '@ionic/react';

import { IconYoutube } from 'assets';
import { MenuLayout } from 'layouts';

import { Strings } from './strings';

import './styles.css';

function Tutorial() {
  return (
    <MenuLayout title="Central de ajuda" mode="back">
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
