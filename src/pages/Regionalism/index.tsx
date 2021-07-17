import React from 'react';

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
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';

import regionalismData from '../../data/regionalism';
import { MenuLayout } from '../../layouts';
import { RootState } from '../../store';
import { Creators } from '../../store/ducks/regionalism';
import { Strings } from './strings';

import './styles.css';

export interface RegionalismItem {
  name: string;
  url: any;
}

function Regionalism() {
  const dispatch = useDispatch();
  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current,
  );
  const renderItem = (item: RegionalismItem) => (
    <IonItem class="regionalism-item">
      <IonImg src={item.url} />
      <IonText class="regionalism-text">{item.name}</IonText>
      <IonRadio slot="end" value={item.name} />
    </IonItem>
  );
  function handleOnChange(evt: CustomEvent<RadioGroupChangeEventDetail>) {
    dispatch(Creators.setCurrentRegionalism(evt.detail.value));
  }
  console.log(currentRegionalism);
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
            <IonRadioGroup
              value={currentRegionalism}
              onIonChange={handleOnChange}
            >
              {regionalismData.map(item => renderItem(item))}
            </IonRadioGroup>
          </IonList>
          <div className="regionalism-icon-save">
            <IonButton class="regionalism-cancel">
              {Strings.BUTTON_CANCEL}
            </IonButton>
            <IonButton class="regionalism-save">
              {Strings.BUTTON_SAVE}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </MenuLayout>
  );
}
export default Regionalism;
