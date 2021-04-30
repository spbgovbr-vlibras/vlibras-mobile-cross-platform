import React from 'react';

import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
  IonItemDivider,
  IonText,
  IonImg,
  IonButton,
  IonButtons,
  IonIcon,
  IonFooter,
  IonBackButton,
} from '@ionic/react';
import { menu, save, trash } from 'ionicons/icons';

import {
  logoAcre,
  logoAlagoas,
  logoAmapa,
  logoAmazonas,
  logoBahia,
  logoBrasil,
  logoCeara,
  logoDF,
  logoEspiritoSanto,
  logoGoiás,
  logoMaranhao,
  logoSalvar,
  logoCancelar,
} from '../../assets';
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
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonText class="regionalism-title">
            {Strings.REGIONALISM_TITLE}
          </IonText>
          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={menu} class="regionalism-toolbar-icon" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonFooter>
          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={logoSalvar} />
            </IonButton>
          </IonButtons>
        </IonFooter>
      </IonHeader>
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
            <IonButton class="regionalism-cancel">Cancelar</IonButton>
            <IonButton class="regionalism-save">Salvar</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Regionalism;
