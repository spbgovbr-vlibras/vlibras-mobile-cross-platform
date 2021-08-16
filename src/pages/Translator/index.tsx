import React, { useState } from 'react';

import {
  IonText,
  IonButton,
  IonTextarea,
  IonContent,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import { PlayerKeys } from 'constants/player';
import { MenuLayout } from 'layouts';
import PlayerService from 'services/unity';
import paths from '../../constants/paths';
import { reloadHistory } from 'utils/setHistory';
import { useDispatch } from 'react-redux';
import { Creators } from 'store/ducks/video';

import { Strings } from './strings';

import './styles.css';
import { IconArrowLeft } from 'assets';

const playerService = PlayerService.getService();

function Translator() {
  const [text, setText] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();

  function translate() {
    const today = new Date().toLocaleDateString('pt-BR');

    reloadHistory(today, text, 'text');

    //mock
    // dispatch(
    //   Creators.setLastTranslator({
    //     data: text,
    //     date: today,
    //     key: 'text',
    //   }),
    // );

    history.push(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TRANSLATOR_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#969696" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
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
    </IonPage>
  );
}
export default Translator;
