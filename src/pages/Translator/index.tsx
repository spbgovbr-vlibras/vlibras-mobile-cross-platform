import React, { useState } from 'react';

import { IonText, IonButton, IonTextarea, IonContent } from '@ionic/react';
import { useHistory } from 'react-router-dom';

import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import { PlayerKeys } from 'constants/player';
import { MenuLayout } from 'layouts';
import PlayerService from 'services/unity';
import paths from '../../constants/paths';

import { Strings } from './strings';

import './styles.css';

const playerService = PlayerService.getService();

function Translator() {
  const [text, setText] = useState('');
  const history = useHistory();

  function translate() {
    history.push(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  return (
    <MenuLayout title={Strings.TRANSLATOR_TITLE}>
      <IonContent>
        <div className="scroll-content">
          <div className="translator-box">
            <IonText class="translator-header">
              {Strings.TRANSLATOR_HEADER}
            </IonText>
            <div className="translator-input-box">
              <IonTextarea
                class="translator-textarea"
                placeholder={Strings.TRANSLATOR_PLACEHOLDER}
                autofocus
                rows={5}
                cols={5}
                wrap="soft"
                required
                onIonChange={e => setText(e.detail.value!)}
              />
            </div>
          </div>
          <div className="translator-item-button-save">
            <IonButton class="translator-button-save" onClick={translate}>
              <IconHandsTranslate color="white" />
              {Strings.TRANSLATOR_TEXT_BUTTON}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
}
export default Translator;
