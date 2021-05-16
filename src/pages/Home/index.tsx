import React from 'react';

import { IonContent } from '@ionic/react';

import { ExploreContainer } from '../../components';
import { MenuLayout } from '../../layouts';
import { Strings } from './strings';

import './styles.css';

function Home() {
  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <IonContent fullscreen>
        <ExploreContainer name={Strings.CONTENT_TITLE} />
      </IonContent>
    </MenuLayout>
  );
}

export default Home;
