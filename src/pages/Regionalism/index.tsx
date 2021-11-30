import React, { useState } from 'react';

import { RadioGroupChangeEventDetail } from '@ionic/core';
import {
  IonContent,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonItem,
  IonRadio,
  IonText,
  IonImg,
  IonButton,
  IonFooter,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import regionalismData from 'data/regionalism';
import { RootState } from 'store';
import { Creators } from 'store/ducks/regionalism';

import { IconArrowLeft } from '../../assets';
import { Strings } from './strings';
import './styles.css';

export interface RegionalismItem {
  name: string;
  url: any;
}

function Regionalism() {
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();

  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current,
  );
  const [regionalism, setregionalism] = useState(currentRegionalism);

  const renderItem = (item: RegionalismItem) => (
    <IonItem class="regionalism-item">
      <IonImg src={item.url} />
      <IonText class="regionalism-text">{item.name}</IonText>
      <IonRadio slot="end" value={item.name} />
    </IonItem>
  );
  function handleOnChange(evt: CustomEvent<RadioGroupChangeEventDetail>) {
    setregionalism(evt.detail.value);
  }

  function SaveRegionalism() {
    dispatch(Creators.setCurrentRegionalism(regionalism));
    history.goBack();
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.REGIONALISM_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent slot="right">
        <div className="regionalism-list">
          <IonList lines="none">
            <IonListHeader>
              <IonText class="regionalism-infobasic">
                {Strings.INFO_BASIC}
              </IonText>
            </IonListHeader>
            <IonRadioGroup value={regionalism} onIonChange={handleOnChange}>
              {regionalismData.map(item => renderItem(item))}
            </IonRadioGroup>
          </IonList>
        </div>
      </IonContent>
      <IonFooter style={{ background: 'white' }}>
        <div className="regionalism-icon-save">
          <button
            className="regionalism-cancel"
            onClick={() => history.goBack()}
            type="button"
          >
            {Strings.BUTTON_CANCEL}
          </button>
          <button
            type="button"
            className="regionalism-save"
            onClick={() => SaveRegionalism()}
          >
            {Strings.BUTTON_SAVE}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
}
export default Regionalism;
