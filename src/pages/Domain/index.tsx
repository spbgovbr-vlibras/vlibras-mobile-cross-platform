import React, { useState } from 'react';

import {
  IonButton,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

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
    <MenuLayout title={Strings.TITLE_MENU}>
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

      <IonButton className="save-domain" onClick={saveDomain}>
        Salvar domínio
      </IonButton>
    </MenuLayout>
  );
};

export default Domain;
