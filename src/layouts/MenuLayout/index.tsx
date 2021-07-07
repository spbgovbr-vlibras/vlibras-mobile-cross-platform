/* eslint-disable import/order */

import paths from 'constants/paths';

import React, { useMemo } from 'react';

import { menuController } from '@ionic/core';
import {
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonPage,
  IonMenuButton,
  IonLabel,
} from '@ionic/react';
import { IconTranslate, IconCloseCircle, IconShare } from 'assets';
import { useLocation } from 'react-router-dom';

import { Strings } from './strings';

import './styles.css';

interface MenuLayoutProps {
  title: string;
}

const MenuLayout: React.FC<MenuLayoutProps> = ({ children, title }) => {
  const location = useLocation();

  function openMenu() {
    menuController.open();
  }

  const ToolbarAction = useMemo(() => {
    switch (location.pathname) {
      case paths.HOME:
        return (
          <>
            <IonLabel className="menu-item-text">{Strings.MENU_PT_BR}</IonLabel>
            <IconTranslate color="#2365DE" />
          </>
        );
      case paths.HISTORY:
      case paths.DICTIONARY:
        return <IconCloseCircle color="#2365DE" />;

      case paths.ABOUT:
        return <IconShare color="#4B4B4B" />;

      default:
        return null;
    }
  }, [location]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title">{title}</IonTitle>
          <IonButtons slot="start">
            <IonMenuButton
              autoHide
              onClick={openMenu}
              className="menu-icon-drawer"
            />
          </IonButtons>
          <IonButtons slot="end">
            <div className="menu-container-end">{ToolbarAction}</div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      {children}
    </IonPage>
  );
};

export default MenuLayout;
