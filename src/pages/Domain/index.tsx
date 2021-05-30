import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import {
  IonButton,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
} from '@ionic/react';
import { MenuLayout } from '../../layouts';
import paths from '../../constants/paths';

import { Strings } from './strings';
import './styles.css';

const Domain = () => {
  const [domain, setDomain] = useState('saude');
  const history = useHistory();

  const styles = {
    activeBg: {
      '--background': '#ededed',
    },
    activeColor: {
      '--font-color': '#1447a6',
    },
  };

  const renderItems = () => {
    let domains = [
      ['saude', Strings.FIRST_OPT_DOMAIN],
      ['educacao', Strings.SECOND_OPT_DOMAIN],
      ['tecnologia', Strings.THIRD_OPT_DOMAIN],
    ];

    return domains.map(item => (
      <IonItem key={item[0]} style={domain == item[0] ? styles.activeBg : {}}>
        <IonLabel
          className="item-domain"
          style={domain == item[0] ? styles.activeColor : {}}
        >
          {item[1]}
        </IonLabel>
        <IonRadio mode="md" value={item[0]} className="radio" />
      </IonItem>
    ));
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

      <IonButton
        className="save-domain"
        onClick={() => history.push(paths.TRANSLATORPT)}
      >
        Salvar domínio
      </IonButton>
    </MenuLayout>
  );
};

export default Domain;
