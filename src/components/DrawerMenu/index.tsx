/* eslint-disable import/order */
import React, { useState } from 'react';

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
  IonSelect,
  IonSelectOption,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useHistory, useLocation } from 'react-router-dom';

import {
  IconTranslate,
  IconDictionary,
  IconRegionalism,
  IconInfo,
  IconTutorial,
  IconDomain,
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
  if (videoArea(value, expected)) {
    return CLASS_NAME_ACTIVED_MENU;
  }
  return value === expected ? CLASS_NAME_ACTIVED_MENU : CLASS_NAME_MENU;
}

function getColor(value: string, expected: string): string {
  if (videoArea(value, expected)) {
    return ACTIVED_COLOR;
  }
  return value === expected ? ACTIVED_COLOR : DEFAULT_COLOR;
}

function videoArea(value: string, expected: string) {
  return (
    (expected == paths.RECORDERAREA ||
      expected == paths.SIGNALCAPTURE ||
      expected == paths.ONBOARDING) &&
    value == '/'
  );
}

function DrawerMenu({ contentId }: DrawerMenuProps) {
  const isVideoScreen = useSelector(
    ({ video }: RootState) => video.isVideoScreen,
  );

  const [openSelect, setOpenSelect] = useState(false);
  const [valueSelected, setValueSelected] = useState<string>('');

  const location = useLocation();
  const history = useHistory();

  function navLink(path: string) {
    if (path != paths.HOME) {
      history.push(path);
      menuController.close();
    }
  }

  function personalizedNavLink(path: string) {
    if (path == paths.HOME) {
      if (valueSelected == 'PT-BR') {
        history.push(paths.RECORDERAREA);
      } else {
        history.push(path);
      }
      menuController.close();
      setOpenSelect(false);
    }
  }

  function setValue(value: string) {
    setValueSelected(value);
    setOpenSelect(false);
  }

  const domain = useSelector(({ video }: RootState) => video.domain);

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
      <span
        className="drawer-menu-item-label"
        onClick={() => personalizedNavLink(tab)}
      >
        {title}
      </span>

      {title === Strings.TITLE_MENU_TRANSLATOR && (
        <>
          <p
            className="drawer-menu-sub-item"
            onClick={() => setOpenSelect(true)}
          >
            {valueSelected ? valueSelected : 'Libras'}
          </p>
          <div className="arrow-down"> </div>
        </>
      )}
      {title === Strings.TITLE_MENU_DOMAIN && (
        <>
          <p className="drawer-menu-sub-item"> {domain} </p>
          <div className="arrow-down"> </div>
        </>
      )}
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
        {openSelect && (
          <div className="dropdown-trans-picker">
            <div
              className={
                valueSelected == 'Libras' || valueSelected == ''
                  ? 'option-trans selected'
                  : 'option-trans'
              }
              onClick={() => setValue('Libras')}
            >
              Libras
            </div>
            <div
              className={
                valueSelected == 'PT-BR'
                  ? 'option-trans selected'
                  : 'option-trans'
              }
              onClick={() => setValue('PT-BR')}
            >
              PT-BR
            </div>
          </div>
        )}
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
          {isVideoScreen
            ? renderItemTab(
                paths.DOMAIN,
                Strings.TITLE_MENU_DOMAIN,
                IconDomain,
                true,
              )
            : renderItemTab(
                paths.REGIONALISM,
                Strings.TITLE_MENU_REGIONALISM,
                IconRegionalism,
                true,
              )}
        </IonList>
        <IonList lines="none">
          {renderItemTab(
            paths.ONBOARDING,
            Strings.TITLE_MENU_TUTORIAL,
            IconTutorial,
            false,
          )}
          {renderItemTab(
            paths.ABOUT,
            Strings.TITLE_MENU_ABOUT,
            IconInfo,
            false,
          )}
        </IonList>
      </div>
    </IonMenu>
  );
}

export default DrawerMenu;
