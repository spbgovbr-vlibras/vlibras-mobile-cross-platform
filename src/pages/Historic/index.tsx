import React, { useEffect, useState } from 'react';

import {
  IonChip,
  IonContent,
  IonItem,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { VideoOutputModal } from '../../components';
import { NativeStorage } from '@ionic-native/native-storage';
import dateFormat from 'utils/dateFormat';
import { env } from '../../environment/env';

import { logoTranslator1, logoTranslator2 } from '../../assets';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

function Historic() {
  const translationsHistoric = useSelector(
    ({ video }: RootState) => video.translationsHistoric,
  );

  const [showModal, setShowModal] = useState(false);
  const [results, setResults] = useState([]);
  const [log, setLog] = useState([]);

  const [historyStorage, setHistoryStorage] = useState<any>({});
  const [keysToShow, setKeysToShow] = useState(
    env.videoTranslator ? ['text', 'video'] : ['text'],
  );
  const [activeKey, setActiveKey] = useState(env.videoTranslator ? 0 : 2);

  const style = { color: '#1447a6', background: '#d6e5f9', fontWeight: 'bold' };

  const promiseHistory = NativeStorage.getItem('history').then(
    data => data,
    error => {
      setLog(error);
      return {};
    },
  );

  const loadHistory = async () => {
    const resultPromise = await promiseHistory;
    setHistoryStorage(resultPromise);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const renderItems = () => {
    //if you are mocking the app to use it on ur browser,
    //you must use the object translationsHistoric instead historyStorage

    // const datesMapped = Object.keys(historyStorage).reverse();
    console.log(translationsHistoric);
    const datesMapped = Object.keys(translationsHistoric).reverse();

    return datesMapped.map(column => {
      if (translationsHistoric[column]['video']) {
        return translationsHistoric[column]['video'].map(
          (item: any, key: any) => {
            // return historyStorage[column].map((item: any, key: any) => {
            return (
              <div>
                {key === 0 && (
                  <p className="date-desc"> {dateFormat(column)} </p>
                )}
                <div
                  className="container-outputs"
                  onClick={() => openModalOutput(item)}
                >
                  {item.map((value: string, key: string) => (
                    <span key={key}>{value}</span>
                  ))}
                </div>
              </div>
            );
          },
        );
      }
    });
  };

  const formatArrayDate = (arrayHistoric: any) => {
    const dates = Object.keys(arrayHistoric);
    const formattedObjDate: any = {};

    dates.map(element => {
      if (formattedObjDate[dateFormat(element)]) {
        if (formattedObjDate[dateFormat(element)]['video']) {
          formattedObjDate[dateFormat(element)]['video'].push(
            arrayHistoric[element]['video'],
          );
        }
        if (formattedObjDate[dateFormat(element)]['text']) {
          formattedObjDate[dateFormat(element)]['text'].push(
            arrayHistoric[element]['text'],
          );
        }
      } else {
        formattedObjDate[dateFormat(element)] = arrayHistoric[element];
      }
    });

    return formattedObjDate;
  };

  const renderAllItems = () => {
    const formattedHistoric = formatArrayDate(historyStorage);
    const datesMapped = Object.keys(formattedHistoric).reverse();
    let doesntHaveKey: number;

    console.log(formattedHistoric);
    console.log(datesMapped);

    return datesMapped.map(column => {
      doesntHaveKey = 0;
      return keysToShow.map((key, keyOfKeys) => {
        if (formattedHistoric[column][key]) {
          return formattedHistoric[column][key].map(
            (item: any, elementKey: any) => {
              return (
                <div>
                  {elementKey === 0 &&
                    (keyOfKeys == 0 || doesntHaveKey == 1) && (
                      <p className="date-desc"> {column} </p>
                    )}
                  {key == 'video' ? (
                    <>
                      {elementKey === 0 && (
                        <div className="historic-container-ion-img-2">
                          <img
                            src={logoTranslator2}
                            className="historic-container-ion-img-translator-2"
                          />
                          <IonText>{Strings.TRANSLATOR_TEXT_2}</IonText>
                        </div>
                      )}
                      <div
                        className="container-outputs"
                        onClick={() => openModalOutput(item)}
                      >
                        {item.map((value: string, keyWord: string) => (
                          <span key={keyWord}>{value}</span>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      {elementKey === 0 && (
                        <div className="historic-container-ion-img-1">
                          <img
                            src={logoTranslator1}
                            className="historic-container-ion-img-translator-1"
                          />
                          <IonText>{Strings.TRANSLATOR_TEXT_1}</IonText>
                        </div>
                      )}
                      <div className="historic-container-box-ion-text">
                        <IonItem class="historic-container-box-ion-item">
                          <IonTextarea
                            placeholder={item}
                            class="historic-container-box-ion-text-area"
                            // disabled={true}
                          />
                        </IonItem>
                      </div>
                    </>
                  )}
                </div>
              );
            },
          );
        } else {
          doesntHaveKey = 1;
          return <></>;
        }
      });
    });
  };

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
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
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="historic-container">
          <div className="historic-container-ion-chips">
            {env.videoTranslator && (
              <IonChip
                class={'historic-container-ion-chip'}
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
            <IonChip
              class="historic-container-ion-chip"
              onClick={() => setScreenKey(2)}
              style={activeKey === 2 ? style : {}}
            >
              {Strings.CHIP_TEXT_3}
            </IonChip>
          </div>

          <div className="container-render-historic">{renderAllItems()}</div>
          <VideoOutputModal
            outputs={results}
            showButtons={false}
            showModal={showModal}
            setShowModal={setShowModal}
            playerIntermedium={true}
          />
        </div>
      </IonContent>
    </MenuLayout>
  );
}

export default Historic;
