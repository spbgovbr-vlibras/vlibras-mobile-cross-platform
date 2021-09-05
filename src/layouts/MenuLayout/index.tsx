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
import { useDispatch } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';

import {
  IconTranslate,
  IconCloseCircle,
  IconShare,
  IconArrowLeft,
} from 'assets';
import paths from 'constants/paths';
import { Creators } from 'store/ducks/video';

import { Strings } from './strings';

import './styles.css';

type MODE = 'menu' | 'back';

interface MenuLayoutProps {
  title: string;
  mode?: MODE;
}

const MenuLayout: React.FC<MenuLayoutProps> = ({
  children,
  title,
  mode = 'menu',
}) => {
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
            {/* <IonLabel
              className="menu-item-text"
              onClick={() => history.push(paths.ONBOARDING)}
            >
              {Strings.MENU_PT_BR}
            </IonLabel>
            <IconTranslate color="#315EB1" /> */}
          </>
        );
      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        dispatch(Creators.setIsVideoScreen(true));
        return (
          <>
            <IonLabel
              className="menu-item-text"
              onClick={() => history.push(paths.HOME)}
            >
              LIBRAS
            </IonLabel>
            <IconTranslate color="#315EB1" />
          </>
        );
      case paths.ABOUT:
        return <IconShare color="#4B4B4B" />;

      default:
        return null;
    }
  }, [location, history, dispatch]);

  return (
    <IonPage className="menu-layout-container">
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title">{title}</IonTitle>
          <IonButtons slot="start">
            {mode === 'menu' ? (
              <IonMenuButton
                autoHide
                onClick={openMenu}
                className="menu-icon-drawer"
              />
            ) : (
              <Link to={paths.HOME} className="menu-item-link">
                <IconArrowLeft color="#315EB1" />
              </Link>
            )}
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
