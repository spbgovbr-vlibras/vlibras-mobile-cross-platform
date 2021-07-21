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
import { useHistory, useLocation } from 'react-router-dom';
import { RootState } from 'store';
import { Creators } from 'store/ducks/video';
import { useDispatch } from 'react-redux';

import { IconTranslate, IconCloseCircle, IconShare } from 'assets';
import paths from 'constants/paths';

import { Strings } from './strings';

import './styles.css';

interface MenuLayoutProps {
  title: string;
}

const MenuLayout: React.FC<MenuLayoutProps> = ({ children, title }) => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();

  function openMenu() {
    menuController.open();
  }

  const ToolbarAction = useMemo(() => {
    switch (location.pathname) {
      case paths.HOME:
        dispatch(Creators.setIsVideoScreen(false));
        return (
          <>
            <span
              className="menu-item-text"
              onClick={() => history.push(paths.ONBOARDING)}
            >
              {Strings.MENU_PT_BR}
            </span>
            <IconTranslate color="#2365DE" />
          </>
        );
      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        dispatch(Creators.setIsVideoScreen(true));
        return (
          <>
            <span
              className="menu-item-text"
              onClick={() => history.push(paths.HOME)}
            >
              LIBRAS
            </span>
            <IconTranslate color="#2365DE" />
          </>
        );
      case paths.HISTORY:
      case paths.TRANSLATOR:
      case paths.DICTIONARY:
        return (
          <button onClick={() => history.goBack()} type="button">
            <IconCloseCircle color="#2365DE" />
          </button>
        );

      case paths.ABOUT:
        return <IconShare color="#4B4B4B" />;

      default:
        return null;
    }
  }, [location, history]);

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
