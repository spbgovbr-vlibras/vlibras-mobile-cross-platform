/* eslint-disable import/order */
import React from 'react';

import { menuController } from '@ionic/core';
import {
  IonMenu,
  IonHeader,
  IonImg,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
  IonIcon,
} from '@ionic/react';
import { useHistory, useLocation } from 'react-router-dom';

import {
  IconTranslate,
  IconDictionary,
  IconRegionalism,
  IconIcaro,
  IconTutorial,
  Vlibraslogo,
} from 'assets';
import { SVGProps } from 'assets/icons/types';
import paths from 'constants/paths';

import { Strings } from './strings';

import './styles.css';

interface DrawerMenuProps {
  contentId: string;
}

const CLASS_NAME_MENU = 'drawer-menu-item';
const CLASS_NAME_ACTIVED_MENU = `drawer-menu-item-activated ${CLASS_NAME_MENU}`;
const ACTIVED_COLOR = '#2365DE';
const DEFAULT_COLOR = '#4B4B4B';

function getClassName(value: string, expected: string): string {
  return value === expected ? CLASS_NAME_ACTIVED_MENU : CLASS_NAME_MENU;
}

function getColor(value: string, expected: string): string {
  return value === expected ? ACTIVED_COLOR : DEFAULT_COLOR;
}

function DrawerMenu({ contentId }: DrawerMenuProps) {
  const location = useLocation();
  const history = useHistory();

  function navLink(path: string) {
    history.push(path);
    menuController.close();
  }

  const renderItemTab = (
    tab: string,
    title: string,
    IconComponent: React.ComponentType<SVGProps>,
    selectable: boolean,
  ) => (
    <IonItem
      className={
        selectable ? getClassName(tab, location.pathname) : CLASS_NAME_MENU
      }
      detail={false}
      onClick={() => navLink(tab)}
    >
      <IconComponent
        color={selectable ? getColor(tab, location.pathname) : DEFAULT_COLOR}
      />
      <span className="drawer-menu-item-label">{title}</span>
    </IonItem>
  );

  return (
    <IonMenu side="start" menuId={Strings.MENU_ID} contentId={contentId}>
      <IonHeader className="drawer-menu-container" mode="ios">
        <div className="drawer-menu-header-logo">
          <IonImg className="drawer-menu-image-header" src={Vlibraslogo} />
          <IonLabel className="drawer-menu-header-label">
            {Strings.HEADER_VLIBRAS_LABEL}
          </IonLabel>
        </div>
        <IonList lines="none">
          <IonListHeader>
            <IonLabel className="drawer-menu-title-header">
              {Strings.HEADER_TITLE_SERVICES}
            </IonLabel>
          </IonListHeader>
          {renderItemTab(
            paths.HOME,
            Strings.TITLE_MENU_TRANSLATOR,
            IconTranslate,
            true,
          )}
          {renderItemTab(
            paths.DICTIONARY,
            Strings.TITLE_MENU_DICTIONARY,
            IconDictionary,
            true,
          )}
        </IonList>
      </IonHeader>
      <div className="drawer-menu-divider" />
      <div className="drawer-menu-content">
        <IonList lines="none">
          <IonListHeader>
            <IonLabel className="drawer-menu-title-header">
              {Strings.HEADER_TITLE_DEFINITIONS}
            </IonLabel>
          </IonListHeader>
          {renderItemTab(
            paths.REGIONALISM,
            Strings.TITLE_MENU_REGIONALISM,
            IconRegionalism,
            true,
          )}
        </IonList>
        <IonList lines="none">
          {renderItemTab(
            paths.TUTORIAL,
            Strings.TITLE_MENU_TUTORIAL,
            IconTutorial,
            false,
          )}
          {renderItemTab(
            paths.ABOUT,
            Strings.TITLE_MENU_ABOUT,
            IconIcaro,
            false,
          )}
        </IonList>
      </div>
    </IonMenu>
  );
}

export default DrawerMenu;
