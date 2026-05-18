import { menuController } from '@ionic/core';
import {
  IonButtons,
  IonHeader,
  IonTitle,
  IonToolbar,
  IonPage,
  IonMenuButton,
  IonLabel,
  IonActionSheet,
} from '@ionic/react';
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useLocation } from 'react-router-dom';

import { IconTranslate, IconArrowLeft, IconInfo } from 'assets';
import paths from 'constants/paths';
import { RootState } from 'store';
import { Creators as CreatorText } from 'store/ducks/translator';
import { Creators } from 'store/ducks/video';

import { Strings } from './strings';

import './styles.css';

type MODE = 'menu' | 'back';

interface MenuLayoutProps {
  title: string;
  mode?: MODE;
  onClearArea?: () => void;
}

const MenuLayout: React.FC<MenuLayoutProps> = ({
  children,
  title,
  mode = 'menu',
}) => {
  const location = useLocation();
  const history = useHistory();
  const dispatch = useDispatch();
  const [helpSheetOpen, setHelpSheetOpen] = useState(false);

  const isVideoScreen = useSelector(
    ({ video }: RootState) => video.isVideoScreen
  );

  useEffect(() => {
    const p = location.pathname;
    if (p === paths.HOME || p === paths.HISTORY) {
      dispatch(Creators.setIsVideoScreen(false));
    } else if (p === paths.RECORDERAREA || p === paths.ONBOARDING) {
      dispatch(Creators.setIsVideoScreen(true));
      dispatch(Creators.setFirstAccess(false));
    }
  }, [location.pathname, dispatch]);

  function openMenu() {
    menuController.open();
  }

  const ToolbarAction = useMemo(() => {
    switch (location.pathname) {
      case paths.HOME:
      case paths.HISTORY:
        return (
          <button
            type="button"
            aria-label={Strings.HELP_INFO_BUTTON_LABEL}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
            }}
            onClick={() => setHelpSheetOpen(true)}>
            <IconInfo color="#363636" size={24} />
          </button>
        );

      case paths.RECORDERAREA:
      case paths.ONBOARDING:
        return (
          <>
            <IonLabel
              className="menu-item-text"
              onClick={() => history.push(paths.HOME)}>
              LIBRAS
            </IonLabel>
            <IconTranslate color="#315EB1" />
          </>
        );

      default:
        return null;
    }
  }, [location.pathname, history]);

  const onClearText = () => dispatch(CreatorText.setTranslatorText(''));

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
                onClick={onClearText}
                className="menu-item-link">
                <IconArrowLeft color="var(--VLibras---Light-Black-1, #363636)" />
              </Link>
            )}
          </IonButtons>
          <IonButtons slot="end">
            <div className="menu-container-end">{ToolbarAction}</div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonActionSheet
        isOpen={helpSheetOpen}
        header={Strings.HELP_SHEET_HEADER}
        onDidDismiss={() => setHelpSheetOpen(false)}
        buttons={[
          {
            text: Strings.HELP_SHEET_HELP_CENTER,
            handler: () => {
              history.push(paths.TUTORIAL);
            },
          },
          {
            text: Strings.HELP_SHEET_ABOUT,
            handler: () => {
              history.push(paths.ABOUT);
            },
          },
          {
            text: Strings.HELP_SHEET_CANCEL,
            role: 'cancel',
          },
        ]}
      />
      {children}
    </IonPage>
  );
};

export default MenuLayout;
