import React from 'react';

import { menuController } from '@ionic/core';
import {
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
  IonPage,
} from '@ionic/react';
import { shareSocial, menu } from 'ionicons/icons';

import './styles.css';

interface MenuLayoutProps {
  title: string;
}

const MenuLayout: React.FC<MenuLayoutProps> = ({ children, title }) => {
  function openMenu() {
    menuController.open();
  }

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title">{title}</IonTitle>
          <IonButtons slot="start">
            <IonButton onClick={openMenu}>
              <IonIcon icon={menu} className="menu-icon-drawer" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={shareSocial} className="menu-icon-share" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {children}
    </IonPage>
  );
};

export default MenuLayout;
