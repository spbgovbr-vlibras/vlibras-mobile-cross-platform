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

function Regionalism() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonText class="Regionalism-Title">
            {Strings.REGIONALISM_TITLE}
          </IonText>
          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={menu} class="Regionalism-Toolbar-Icon" />
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
        <div className="Regionalism-List">
          <IonList lines="none">
            <IonListHeader>
              <IonText class="Regionalism-InfoBasic">
                {Strings.INFO_BASIC}
              </IonText>
            </IonListHeader>
            <IonRadioGroup value={1} onIonChange={e => 'none'}>
              <IonItem class="Regionalism-Item">
                <IonImg src={logoBrasil} />
                <IonText class="Regionalism-Brasil">Brasil</IonText>
                <IonRadio slot="end" value="Brasil" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoAcre} />
                <IonText class="Regionalism-Acre">Acre</IonText>
                <IonRadio slot="end" value="Acre" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoAlagoas} />
                <IonText class="Regionalism-Alagoas">Alagoas</IonText>
                <IonRadio slot="end" value="Alagoas" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoAmapa} />
                <IonText class="Regionalism-Amapá">Amapá</IonText>
                <IonRadio slot="end" value="Amapá" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoAmazonas} />
                <IonText class="Regionalism-Amazonas">Amazonas</IonText>
                <IonRadio slot="end" value="Amazonas" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoBahia} />
                <IonText class="Regionalism-Bahia">Bahia</IonText>
                <IonRadio slot="end" value="Bahia" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoCeara} />
                <IonText class="Regionalism-Ceará">Ceará</IonText>
                <IonRadio slot="end" value="Ceará" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoDF} />
                <IonText class="Regionalism-DistritoFederal">
                  Distrito Federal
                </IonText>
                <IonRadio slot="end" value="Distrito Federal" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoEspiritoSanto} />
                <IonText class="Regionalism-EspiritoSanto">
                  EspiritoSanto
                </IonText>
                <IonRadio slot="end" value="EspiritoSanto" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoGoiás} />
                <IonText class="Regionalism-Goiás">Goiás</IonText>
                <IonRadio slot="end" value="Góias" />
              </IonItem>

              <IonItem class="Regionalism-Item">
                <IonImg src={logoMaranhao} />
                <IonText class="Regionalism-Maranhão"> Maranhão</IonText>
                <IonRadio slot="end" value="Maranhão" />
              </IonItem>
            </IonRadioGroup>
          </IonList>
          <div className="Regionalism-Icon-Save">
            <IonButton class="Regionalism-Cancel">Cancelar</IonButton>
            <IonButton class="Regionalism-Save">Salvar</IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default Regionalism;
