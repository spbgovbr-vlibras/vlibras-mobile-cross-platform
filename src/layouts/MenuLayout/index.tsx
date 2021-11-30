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
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { IconTranslate, IconShare, IconArrowLeft } from 'assets';
import paths from 'constants/paths';
import { env } from 'environment/env';
import { RootState } from 'store';
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

  const onboardingFirstAccess = useSelector(
    ({ video }: RootState) => video.onboardingFirstAccess,
  );

  const isVideoScreen = useSelector(
    ({ video }: RootState) => video.isVideoScreen,
  );

  function openMenu() {
    menuController.open();
  }

  const ToolbarAction = useMemo(() => {
    switch (location.pathname) {
      case paths.HOME:
        dispatch(Creators.setIsVideoScreen(false));
        if (env.videoTranslator) {
          return (
            <>
              <button
                className="menu-item-text"
                onClick={() =>
                  history.push(
                    onboardingFirstAccess
                      ? paths.ONBOARDING
                      : paths.RECORDERAREA,
                  )
                }
                type="button"
              >
                {Strings.MENU_PT_BR}
              </button>
              <IconTranslate color="#2365DE" />
            </>
          );
        }
        return <></>;

      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        dispatch(Creators.setIsVideoScreen(true));
        dispatch(Creators.setFirstAccess(false));
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
              <Link
                to={isVideoScreen ? paths.RECORDERAREA : paths.HOME}
                className="menu-item-link"
              >
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
