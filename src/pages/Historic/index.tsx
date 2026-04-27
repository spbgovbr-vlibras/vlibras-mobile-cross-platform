import { IonButton, IonContent, IonText, useIonViewWillEnter } from '@ionic/react';
import React, { useEffect, useCallback, useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import PlayerService from 'services/unity';
import { Creators } from 'store/ducks/translator';
import dateFormat from 'utils/dateFormat';
import { reloadHistory, getHistory } from 'utils/setHistory';

import { Strings } from './strings';
import {
  IconArrowUp,
  IconArrowDown,
  logoTranslator1,
  logoTranslator2,
} from '../../assets';
import { BottomTabBar, VideoOutputModal } from '../../components';
import { env } from '../../environment/env';
import { MenuLayout } from '../../layouts';

import './styles.css';

type GenericObject = { [key: string]: any };

function Historic() {
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLIonContentElement>(null);

  const [historyStorage, setHistoryStorage] = useState<GenericObject>({});

  const [keysToShow, setKeysToShow] = useState(
    env.videoTranslator ? ['text', 'video'] : ['text']
  );

  const { setTextPtBr } = useTranslation();
  const playerService = PlayerService.getPlayerInstance();

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
  };

  const loadHistory = useCallback(async () => {
    try {
      const result = await getHistory();
      setHistoryStorage(result || {});
    } catch {
      setHistoryStorage({});
    }
  }, []);

  const hasItemsToRender = (): boolean => {
    return Object.keys(historyStorage).length > 0;
  };

  useEffect(() => {
    if (location.pathname === paths.HISTORY) loadHistory();
  }, [location, loadHistory]);

  // Recarregar histórico toda vez que a página ficar visível
  // (necessário porque o Ionic cacheia páginas no DOM)
  useIonViewWillEnter(() => {
    loadHistory();
  });

  const formatArrayDate = () => {
    const arrayState = JSON.parse(JSON.stringify(historyStorage));
    const dates = Object.keys(arrayState);
    const formattedObjDate: any = {};

    dates.forEach((element) => {
      const formattedDate = dateFormat(element);
      if (formattedObjDate[formattedDate]) {
        if (arrayState[element].video && formattedObjDate[formattedDate].video) {
          formattedObjDate[formattedDate].video.push(
            ...arrayState[element].video
          );
        }
        if (arrayState[element].text && formattedObjDate[formattedDate].text) {
          formattedObjDate[formattedDate].text.push(
            ...arrayState[element].text
          );
        }
      } else {
        formattedObjDate[formattedDate] = {
          text: arrayState[element].text || [],
          video: arrayState[element].video || [],
        };
      }
    });

    return formattedObjDate;
  };

  async function onTranslationHistory(text: string) {
    const formatted = text.trim();
    const today = new Date().toLocaleDateString('pt-BR');

    await reloadHistory(today, formatted, 'text');

    const gloss = await setTextPtBr(formatted, false);

    history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
    dispatch(Creators.setTranslatorText(formatted));
  }

  const scrollUp = () => {
    scrollBy(-100);
  };

  const scrollDown = () => {
    scrollBy(100);
  };

  const scrollBy = (offset: number) => {
    contentRef.current?.scrollByPoint(0, offset, 500);
  };

  const renderAllItems = () => {
    const formattedHistoric = formatArrayDate();
    const datesMapped = Object.keys(formattedHistoric).reverse();
    let doesntHaveKey: number;

    return datesMapped.map((column) => {
      doesntHaveKey = 0;
      return keysToShow.map((key, keyOfKeys) => {
        if (
          formattedHistoric[column][key] &&
          formattedHistoric[column][key].length !== 0
        ) {
          return formattedHistoric[column][key].map(
            (item: any, elementKey: any) => {
              return (
                <div key={`${column}-${key}-${elementKey}`}>
                  {elementKey === 0 &&
                    (keyOfKeys === 0 || doesntHaveKey === 1) && (
                      <p className="date-desc">{column}</p>
                    )}
                  {key === 'video' ? (
                    <>
                      {elementKey === 0 && (
                        <div className="historic-container-ion-img-2">
                          <img
                            src={logoTranslator2}
                            className="historic-container-ion-img-translator-2"
                            alt=""
                          />
                          <IonText>{Strings.TRANSLATOR_TEXT_2}</IonText>
                        </div>
                      )}
                      <div className="list-outputs">
                        <button
                          className="container-outputs"
                          onClick={() => openModalOutput(item)}
                          type="button">
                          {item.map((value: string) => (
                            <span key={uuidv4()}>{value}</span>
                          ))}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {elementKey === 0 && (
                        <div className="historic-container-ion-img-1">
                          <img
                            src={logoTranslator1}
                            className="historic-container-ion-img-translator-1"
                            alt=""
                          />
                          <IonText>{Strings.TRANSLATOR_TEXT_1}</IonText>
                        </div>
                      )}
                      <div
                        className="historic-container-box-ion-text"
                        onClick={() => onTranslationHistory(item)}
                        tabIndex={0}
                        role="menu"
                        aria-hidden="true">
                        <p className="historic-container-box-ion-text-area">
                          {item}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            }
          );
        }
        doesntHaveKey = 1;
        return <React.Fragment key={`${column}-${key}-empty`} />;
      });
    });
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode="menu">
      <IonContent ref={contentRef}>
        <div className="historic-container">
          <div className="container-render-historic">
            {!hasItemsToRender() ? (
              <p className="empty-historic">Histórico vazio</p>
            ) : (
              renderAllItems()
            )}
          </div>
          <VideoOutputModal
            outputs={results}
            showButtons={false}
            showModal={showModal}
            setShowModal={setShowModal}
            playerIntermedium
          />
        </div>
      </IonContent>
      {hasItemsToRender() && (
        <div className="scroll-buttons">
          <IonButton shape="round" className="arrowBtn" onClick={scrollUp}>
            <IconArrowUp />
          </IonButton>
          <IonButton shape="round" className="arrowBtn" onClick={scrollDown}>
            <IconArrowDown />
          </IonButton>
        </div>
      )}
      <BottomTabBar active="history" />
    </MenuLayout>
  );
}

export default Historic;
