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
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { IconArrowLeft } from 'assets';
import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import { MenuLayout } from 'layouts';
import PlayerService from 'services/unity';
import { Creators } from 'store/ducks/translator';
import { reloadHistory } from 'utils/setHistory';

import { Strings } from './strings';

import './styles.css';

const playerService = PlayerService.getService();

const Translator = () => {
  const [text, setText] = useState('');
  const history = useHistory();
  const dispatch = useDispatch();

  const { setTranslateText } = useTranslation();

  function translate() {
    const today = new Date().toLocaleDateString('pt-BR');

    reloadHistory(today, text, 'text');

    // mock
    // dispatch(
    //   Creators.setLastTranslator({
    //     data: text,
    //     date: today,
    //     key: 'text',
    //   }),
    // );

    setTranslateText(text);
    history.push(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, text);
    dispatch(Creators.setTranslatorText(text));
  }

  return (
    <MenuLayout title={Strings.TRANSLATOR_TITLE} mode="back">
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
                rows={5}
                cols={5}
                wrap="soft"
                required
                onIonChange={e => setText(e.detail.value!)}
              />
            </div>
          </div>
          <div className="translator-item-button-save">
            <button
              className="translator-button-save"
              onClick={translate}
              type="button"
            >
              <IconHandsTranslate color="white" />
              <span>{Strings.TRANSLATOR_TEXT_BUTTON}</span>
            </button>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
};

export default Translator;
