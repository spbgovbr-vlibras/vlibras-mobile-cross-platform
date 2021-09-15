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
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import regionalismData from 'data/regionalism';
import { env } from 'environment/env';
import { MenuLayout } from 'layouts';
import { RootState } from 'store';
import { Creators } from 'store/ducks/regionalism';

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
    <MenuLayout title={Strings.REGIONALISM_TITLE}>
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
      <IonFooter>
        <div className="regionalism-icon-save">
          <IonButton
            class="regionalism-cancel"
            onClick={() => history.goBack()}
          >
            {Strings.BUTTON_CANCEL}
          </IonButton>
          <IonButton class="regionalism-save" onClick={() => SaveRegionalism()}>
            {Strings.BUTTON_SAVE}
          </IonButton>
        </div>
      </IonFooter>
    </MenuLayout>
  );
}
export default Regionalism;
