import { IonChip, IonContent, IonText } from '@ionic/react';
import { NativeStorage } from '@ionic-native/native-storage';
import React, { useEffect, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { useTranslation } from 'hooks/Translation';
import PlayerService from 'services/unity';
import { Creators } from 'store/ducks/translator';
import dateFormat from 'utils/dateFormat';
import { reloadHistory } from 'utils/setHistory';

import { Strings } from './strings';
import { logoTranslator1, logoTranslator2 } from '../../assets';
import { VideoOutputModal } from '../../components';
import { env } from '../../environment/env';
import { MenuLayout } from '../../layouts';

import './styles.css';
// import { Creators } from 'store/ducks/customization';

type GenericObject = { [key: string]: any };

function Historic() {
  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();

  const [historyStorage, setHistoryStorage] = useState<GenericObject>({});

  const [keysToShow, setKeysToShow] = useState(
    env.videoTranslator ? ['text', 'video'] : ['text']
  );
  const [activeKey, setActiveKey] = useState(env.videoTranslator ? 0 : 2);

  const style = { color: '#1447a6', background: '#d6e5f9', fontWeight: 'bold' };

  const { setTextPtBr } = useTranslation();
  const playerService = PlayerService.getService();

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
  };

  const loadHistory = useCallback(async () => {
    try {
      const result = await NativeStorage.getItem('history');
      setHistoryStorage(result);
      // eslint-disable-next-line no-empty
    } catch {}
  }, []);

  useEffect(() => {
    if (location.pathname === paths.HISTORY) loadHistory();
  }, [location, loadHistory]);

  const formatArrayDate = () => {
    const arrayState = JSON.parse(JSON.stringify(historyStorage));
    const dates = Object.keys(arrayState);
    const formattedObjDate: any = {};

    dates.forEach((element) => {
      const formattedDate = dateFormat(element);
      if (formattedObjDate[formattedDate]) {
        if (formattedObjDate[formattedDate].video) {
          formattedObjDate[formattedDate].video.push(
            ...arrayState[element].video
          );
        }
        if (formattedObjDate[formattedDate].text) {
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

    reloadHistory(today, formatted, 'text');

    const gloss = await setTextPtBr(formatted, false);

    history.replace(paths.HOME);
    playerService.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.PLAY_NOW, gloss);
    dispatch(Creators.setTranslatorText(formatted));
  }

  const renderAllItems = () => {
    const formattedHistoric = formatArrayDate();
    const datesMapped = Object.keys(formattedHistoric).reverse();
    let doesntHaveKey: number;

    return datesMapped.map((column) => {
      doesntHaveKey = 0;
      return keysToShow.map((key, keyOfKeys) => {
        if (formattedHistoric[column][key].length !== 0) {
          return formattedHistoric[column][key].map(
            (item: any, elementKey: any) => {
              return (
                <div key={elementKey}>
                  {elementKey === 0 &&
                    (keyOfKeys === 0 || doesntHaveKey === 1) && (
                      <p className="date-desc"> {column} </p>
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
                          {item.map((value: string, keyWord: string) => (
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
        return <></>;
      });
    });
  };

  const setScreenKey = (param: number) => {
    setActiveKey(param);
    switch (param) {
      case 0:
        setKeysToShow(['text', 'video']);
        break;
      case 1:
        setKeysToShow(['text']);
        break;
      case 2:
        setKeysToShow(['video']);
        break;
      default:
        break;
    }
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE} mode="back">
      <IonContent>
        <div className="historic-container">
          <div className="historic-container-ion-chips">
            {env.videoTranslator && (
              <IonChip
                className="historic-container-ion-chip"
                onClick={() => setScreenKey(0)}
                style={activeKey === 0 ? style : {}}>
                {Strings.CHIP_TEXT_1}
              </IonChip>
            )}
            {env.videoTranslator && (
              <IonChip
                className="historic-container-ion-chip"
                onClick={() => setScreenKey(1)}
                style={activeKey === 1 ? style : {}}>
                {Strings.CHIP_TEXT_2}
              </IonChip>
            )}
            {env.videoTranslator && (
              <IonChip
                className="historic-container-ion-chip"
                onClick={() => setScreenKey(2)}
                style={activeKey === 2 ? style : {}}>
                {Strings.CHIP_TEXT_3}
              </IonChip>
            )}
          </div>
          <div className="container-render-historic">{Object.keys(historyStorage).length === 0 ? <p>Histórico vazio</p> : renderAllItems()}</div>
          <VideoOutputModal
            outputs={results}
            showButtons={false}
            showModal={showModal}
            setShowModal={setShowModal}
            playerIntermedium
          />
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Historic;
