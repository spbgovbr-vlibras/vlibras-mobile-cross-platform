import React from 'react';

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

import {
  logoAcre,
  logoAlagoas,
  logoAmapa,
  logoBahia,
  logoBrasil,
  logoCeara,
  logoDF,
  logoEspiritoSanto,
  logoGoiás,
  logoMaranhao,
} from 'assets';
import { MenuLayout } from 'layouts';

import { Strings } from './strings';

import './styles.css';

interface RegionalismItem {
  name: string;
  url: any;
}

const states: Array<RegionalismItem> = [
  { name: 'BR - Padrão Nacional', url: logoBrasil },
  { name: 'Acre', url: logoAcre },
  { name: 'Alagoas', url: logoAlagoas },
  { name: 'Amazonas', url: logoAmapa },
  { name: 'Bahia', url: logoBahia },
  { name: 'Ceará', url: logoCeara },
  { name: 'Distrito Federal', url: logoDF },
  { name: 'Espirito Santo', url: logoEspiritoSanto },
  { name: 'Goiás', url: logoGoiás },
  { name: 'Maranhão', url: logoMaranhao },
];

function Regionalism() {
  const renderItem = (item: RegionalismItem) => (
    <IonItem class="regionalism-item">
      <IonImg src={item.url} />
      <IonText class="regionalism-text">{item.name}</IonText>
      <IonRadio slot="end" value={item.name} />
    </IonItem>
  );

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
            <IonRadioGroup value={1} onIonChange={e => 'none'}>
              {states.map(item => renderItem(item))}
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
