/* eslint-disable no-trailing-spaces */
/* eslint-disable import/order */
import { IonText, IonTextarea, IonContent } from '@ionic/react';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';

import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import ErrorModal from 'components/ErrorModal';
import paths from 'constants/paths';
import { regex } from 'constants/types';
import { useTranslation } from 'hooks/Translation';
import { MenuLayout } from 'layouts';
import { RootState } from 'store';
import { Creators } from 'store/ducks/translator';
import { reloadHistory } from 'utils/setHistory';

import { Strings } from './strings';
import './styles.css';

const Translator = () => {
  const translatorText = useSelector(
    ({ translator }: RootState) => translator.translatorText
  );

  const history = useHistory();
  const dispatch = useDispatch();

  const { setTextPtBr } = useTranslation();

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [isListening, setIsListening] = useState(false);

  async function translate() {
    const formatted = translatorText.trim();

    if (formatted === '') {
      setShowErrorModal(true);
      return;
    }

    const today = new Date().toLocaleDateString('pt-BR');
    reloadHistory(today, formatted, 'text');

    if (formatted.toLocaleLowerCase() === 'ativar modo live') {
      history.push(paths.HOME + '?live=1');
      return;
    }

    const gloss = (await setTextPtBr(formatted, false)).toString();

    // Navigate first; Player will trigger playback when Unity is ready.
    history.replace(paths.HOME, { playGloss: gloss, playAt: Date.now() });
    dispatch(Creators.setTranslatorText(formatted));
  }

  const handleMicClick = () => {
    history.push(paths.HOME + '?live=1');
  };

  return (
    <MenuLayout title={Strings.TRANSLATOR_TITLE} mode="back">
      <IonContent>
        <div className="scroll-content">
          <div className="translator-box">
            <IonText className="translator-header">
              {Strings.TRANSLATOR_HEADER}
            </IonText>
            <div className="translator-input-box">
              <IonTextarea
                className="translator-textarea"
                rows={5}
                cols={5}
                wrap="soft"
                value={translatorText}
                required
                onIonInput={(e) =>
                  dispatch(Creators.setTranslatorText(e.detail.value || ''))
                }
              />
              {translatorText.length > 0 && !regex.test(translatorText) && (
                <IonText color="danger">
                  <p className="ion-padding-start">
                    Entrada inválida. Insira pelo menos um caractere alfanumérico (letra ou número).
                  </p>
                </IonText>
              )}
            </div>
          </div>
          <div className="translator-item-button-save" style={{ display: 'flex', gap: 8 }}>
            <button
              className="translator-button-save"
              onClick={translate}
              type="button"
              style={{ height: 48, minWidth: 120 }}
            >
              <IconHandsTranslate color="white" />
              <span>{Strings.TRANSLATOR_TEXT_BUTTON}</span>
            </button>
          </div>
        </div>

        <ErrorModal
          show={showErrorModal}
          errorMsg="Erro ao tentar traduzir: caixa de texto vazia."
          setShow={setShowErrorModal}
        />
      </IonContent>
    </MenuLayout>
  );
};

export default Translator;
