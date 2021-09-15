import React, { useState } from 'react';

import {
  IonButton,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonContent,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { IconArrowLeft } from 'assets';
import paths from 'constants/paths';
import { MenuLayout } from 'layouts';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';

import { Strings } from './strings';
import './styles.css';

const Domain = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const currentDomain = useSelector(({ video }: RootState) => video.domain);

  const [domain, setDomain] = useState(currentDomain);

  const styles = {
    activeBg: {
      '--background': '#ededed',
    },
    activeColor: {
      color: '#1447a6',
    },
  };

  const renderItems = () => {
    const domains = [
      Strings.FIRST_OPT_DOMAIN,
      Strings.SECOND_OPT_DOMAIN,
      Strings.THIRD_OPT_DOMAIN,
    ];

    return domains.map(item => (
      <IonItem key={item} style={domain === item ? styles.activeBg : {}}>
        <IonLabel
          className="item-domain"
          style={domain === item ? styles.activeColor : {}}
        >
          {item}
        </IonLabel>
        <IonRadio mode="md" value={item} className="radio" />
      </IonItem>
    ));
  };

  const saveDomain = () => {
    dispatch(Creators.setDomain(domain));
    history.push(paths.RECORDERAREA);
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TITLE_MENU}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList className="ion-list-domain">
          <IonRadioGroup
            className="ion-radio"
            value={domain}
            onIonChange={e => setDomain(e.detail.value)}
          >
            <IonListHeader>
              <IonLabel className="title-domain">
                Escolha o domínio para as traduções
              </IonLabel>
            </IonListHeader>

            {renderItems()}
          </IonRadioGroup>
        </IonList>
        <div className="button-container-domain">
          <IonButton className="save-domain" onClick={saveDomain}>
            Salvar domínio
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Domain;
