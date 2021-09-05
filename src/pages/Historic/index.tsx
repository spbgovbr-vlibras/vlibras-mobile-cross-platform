import React, { useEffect, useState } from 'react';

import { NativeStorage } from '@ionic-native/native-storage';
import {
  IonChip,
  IonContent,
  IonImg,
  IonItem,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';

import { logoTranslator1, logoTranslator2 } from 'assets';
import { VideoOutputModal } from 'components';
import { MenuLayout } from 'layouts';
import { RootState } from 'store';

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

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
  };

  const renderItems = () => {
    const datesMapped = Object.keys(historyStorage).reverse();

    return datesMapped.map(column => {
      return historyStorage[column].map((item: any, key: any) => {
        return (
          <div>
            {key === 0 && <p className="date-desc"> {column} </p>}
            <button
              className="container-outputs"
              onClick={() => openModalOutput(item)}
              type="button"
            >
              {item.map((value: string) => (
                <span key={uuidv4()}>{value}</span>
              ))}
            </button>
          </div>
        );
      });
    });
  };

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent>
        <div className="historic-container">
          <div className="historic-container-ion-chips">
            <IonChip class="historic-container-ion-chips-1">
              {Strings.CHIP_TEXT_1}
            </IonChip>
            <IonChip class="historic-container-ion-chips-2">
              {Strings.CHIP_TEXT_2}
            </IonChip>
            <IonChip class="historic-container-ion-chips-3">
              {Strings.CHIP_TEXT_3}
            </IonChip>
          </div>
          <div className="historic-container-ion-img-1">
            <IonImg
              src={logoTranslator1}
              class="historic-container-ion-img-translator-1"
            />
            <IonText>{Strings.TRANSLATOR_TEXT_1}</IonText>
          </div>
          <div className="historic-container-box-ion-text">
            <IonItem class="historic-container-box-ion-item">
              <IonTextarea
                placeholder={Strings.TEXT_AREA}
                rows={10}
                class="historic-container-box-ion-text-area"
              />
            </IonItem>
          </div>
          <div className="historic-container-ion-img-2">
            <IonImg
              src={logoTranslator2}
              class="historic-container-ion-img-translator-2"
            />
            <IonText>{Strings.TRANSLATOR_TEXT_2}</IonText>
          </div>
          {renderItems()}

          {log}

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
