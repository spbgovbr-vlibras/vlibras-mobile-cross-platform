import React, { useState } from 'react';

import {
  IonChip,
  IonContent,
  IonImg,
  IonItem,
  IonText,
  IonTextarea,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { VideoOutputModal } from '../../components';

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

  const renderItems = () => {
    return translationsHistoric.map((item: any) => {
      return (
        <div
          className="container-outputs"
          onClick={() => openModalOutput(item)}
        >
          {item.map((value: string, key: string) => (
            <span key={key}>{value}</span>
          ))}
        </div>
      );
    });
  };

  const openModalOutput = (actualItem: any) => {
    setShowModal(true);
    setResults(actualItem);
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
