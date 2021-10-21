import React, { useEffect, useMemo, useState } from 'react';

import { NativeStorage } from '@ionic-native/native-storage';
import {
  IonChip,
  IonContent,
  IonItem,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

import { RootState } from 'store';
import dateFormat from 'utils/dateFormat';

import { logoTranslator1, logoTranslator2 } from '../../assets';
import { VideoOutputModal } from '../../components';
import { env } from '../../environment/env';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';
import paths from 'constants/paths';

type GenericObject = { [key: string]: any };

function Historic() {
  const translationsHistoric = useSelector(
    ({ video }: RootState) => video.translationsHistoric,
  );

  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const [log, setLog] = useState([]);
  const location = useLocation();

  const [historyStorage, setHistoryStorage] = useState<GenericObject>({});

  const [keysToShow, setKeysToShow] = useState(
    env.videoTranslator ? ['text', 'video'] : ['text'],
  );
  const [activeKey, setActiveKey] = useState(env.videoTranslator ? 0 : 2);

  const style = { color: '#1447a6', background: '#d6e5f9', fontWeight: 'bold' };

  const promiseHistory = NativeStorage.getItem('history').then(
    data => {
      return data;
    },
    error => {
      setLog(error);
      return {};
    },
  );

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
  };

  const loadHistory = async () => {
    setHistoryStorage(await promiseHistory);
  };

  // const arrayTest: GenericObject = {
  //   '17/10/2021': { text: ['oi'] },
  //   '19/10/2021': {
  //     video: [
  //       ['Pneumonia', 'Pneumonia'],
  //       ['exame_medico', 'nausea', 'exame_medico'],
  //       ['saude'],
  //     ],
  //     text: ['alo meu nome é maria', 'testando', 'ok', 'teste'],
  //   },
  // };

  useEffect(() => {
    if (location.pathname === paths.HISTORY) loadHistory();
  }, [location]);

  const formatArrayDate = () => {
    const arrayState = JSON.parse(JSON.stringify(historyStorage));
    const dates = Object.keys(arrayState);
    const formattedObjDate: any = {};

    dates.forEach(element => {
      const formattedDate = dateFormat(element);
      if (formattedObjDate[formattedDate]) {
        if (formattedObjDate[formattedDate].video) {
          formattedObjDate[formattedDate].video.push(
            ...arrayState[element].video,
          );
        }
        if (formattedObjDate[formattedDate].text) {
          formattedObjDate[formattedDate].text.push(
            ...arrayState[element].text,
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

  const renderAllItems = () => {
    const formattedHistoric = formatArrayDate();
    const datesMapped = Object.keys(formattedHistoric).reverse();
    let doesntHaveKey: number;

    return datesMapped.map(column => {
      doesntHaveKey = 0;
      return keysToShow.map((key, keyOfKeys) => {
        if (formattedHistoric[column][key]) {
          return formattedHistoric[column][key].map(
            (item: any, elementKey: any) => {
              return (
                <div>
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
                          type="button"
                        >
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
                      <div className="historic-container-box-ion-text">
                        <p className="historic-container-box-ion-text-area">
                          {item}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              );
            },
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
                class="historic-container-ion-chip"
                onClick={() => setScreenKey(0)}
                style={activeKey === 0 ? style : {}}
              >
                {Strings.CHIP_TEXT_1}
              </IonChip>
            )}
            {env.videoTranslator && (
              <IonChip
                class="historic-container-ion-chip"
                onClick={() => setScreenKey(1)}
                style={activeKey === 1 ? style : {}}
              >
                {Strings.CHIP_TEXT_2}
              </IonChip>
            )}
            {env.videoTranslator && (
              <IonChip
                class="historic-container-ion-chip"
                onClick={() => setScreenKey(2)}
                style={activeKey === 2 ? style : {}}
              >
                {Strings.CHIP_TEXT_3}
              </IonChip>
            )}
          </div>
          <div className="container-render-historic">{renderAllItems()}</div>
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
