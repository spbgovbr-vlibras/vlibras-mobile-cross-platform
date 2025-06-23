import React, { useMemo, useCallback, useEffect } from 'react';

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
import { Link as RouterLink, useHistory, useLocation } from 'react-router-dom';

import { IconTranslate, IconArrowLeft } from 'assets';
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

  const { onboardingFirstAccess, isVideoScreen } = useSelector(
    ({ video }: RootState) => ({
      onboardingFirstAccess: video.onboardingFirstAccess,
      isVideoScreen: video.isVideoScreen,
    })
  );

  // Efeitos colaterais (dispatch) devem ficar em um useEffect
  useEffect(() => {
    switch (location.pathname) {
      case paths.HOME:
        dispatch(Creators.setIsVideoScreen(false));
        break;
      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        dispatch(Creators.setIsVideoScreen(true));
        dispatch(Creators.setFirstAccess(false));
        break;
      default:
        break;
    }
  }, [location.pathname, dispatch]);

  // Use useCallback para memoizar funções de clique
  const handleNavigateToRecorder = useCallback(() => {
    const destination = onboardingFirstAccess
      ? paths.ONBOARDING
      : paths.RECORDERAREA;
    history.push(destination);
  }, [history, onboardingFirstAccess]);

  const handleNavigateToHome = useCallback(() => {
    history.push(paths.HOME);
  }, [history]);

  // A função openMenu é estável, não precisa de useCallback
  const openMenu = useCallback(() => {
    menuController.open();
  }, []);

  // useMemo é ótimo para computar um valor (JSX, neste caso)
  const ToolbarAction = useMemo(() => {
    switch (location.pathname) {
      case paths.HOME:
        if (env.videoTranslator) {
          return (
            <>
              <button
                className="menu-item-text"
                onClick={handleNavigateToRecorder}
                type="button">
                {Strings.MENU_PT_BR}
              </button>
              <IconTranslate color="#2365DE" />
            </>
          );
        }
        return null;

      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        return (
          <>
            <IonLabel
              slot="start"
              className="menu-item-text"
              onClick={handleNavigateToHome}>
              LIBRAS
            </IonLabel>
            <IconTranslate color="#315EB1" />
          </>
        );

      default:
        return null;
    }
    // Adicionamos as novas funções como dependência
  }, [location.pathname, handleNavigateToRecorder, handleNavigateToHome]);

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
              <RouterLink
                to={isVideoScreen ? paths.RECORDERAREA : paths.HOME}
                className="menu-item-link">
                <IconArrowLeft color="#315EB1" />
              </RouterLink>
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
