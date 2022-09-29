/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
import React, { useEffect, useState, useRef } from 'react';

import { menuController } from '@ionic/core';
import {
  IonMenu,
  IonHeader,
  IonImg,
  IonList,
  IonItem,
  IonListHeader,
  IonLabel,
  IonMenuButton,
} from '@ionic/react';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { useHistory, useLocation } from 'react-router-dom';
import { env } from '../../environment/env';

import {
  IconTranslate,
  IconDictionary,
  IconRegionalism,
  IconInfo,
  IconTutorial,
  IconDomain,
  IconCustomization,
  Vlibraslogo,
} from 'assets';
import { SVGProps } from 'assets/icons/types';
import paths from 'constants/paths';
import RegionalismArray from 'data/regionalism';

import { Strings } from './strings';

import './styles.css';

interface DrawerMenuProps {
  contentId: string;
}

const CLASS_NAME_MENU = 'drawer-menu-item';
const CLASS_NAME_ACTIVED_MENU = `drawer-menu-item-activated ${CLASS_NAME_MENU}`;
const ACTIVED_COLOR = '#2365DE';
const DEFAULT_COLOR = '#4B4B4B';

function videoArea(value: string, expected: string) {
  return (
    (expected === paths.RECORDERAREA ||
      expected === paths.SIGNALCAPTURE ||
      expected === paths.ONBOARDING) &&
    value === '/'
  );
}

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

function DrawerMenu({ contentId }: DrawerMenuProps) {
  const isVideoScreen = useSelector(
    ({ video }: RootState) => video.isVideoScreen,
  );

  const onboardingFirstAccess = useSelector(
    ({ video }: RootState) => video.onboardingFirstAccess,
  );
  const [openSelect, setOpenSelect] = useState(false);
  const [valueSelected, setValueSelected] = useState<string>('');

  const buttonMenu = useRef<any>(null);

  useEffect(() => {
    if (isVideoScreen) {
      setValueSelected('PT-BR');
    } else {
      setValueSelected('Libras');
    }
  }, [isVideoScreen]);

  const location = useLocation();
  const history = useHistory();

  function navLink(e: any, path: string) {
    if (e.target.className === 'drawer-menu-sub-item translator') {
      setOpenSelect(!openSelect);
    } else {
      // eslint-disable-next-line no-lonely-if
      if (path === paths.HOME) {
        if (valueSelected === 'PT-BR') {
          history.push(paths.RECORDERAREA);
        } else {
          history.push(path);
        }
        if (buttonMenu.current) {
          buttonMenu.current.click();
        }
        menuController.close(Strings.MENU_ID);
        setOpenSelect(false);
      } else {
        history.push(path);
        if (buttonMenu.current) {
          buttonMenu.current.click();
        }
        menuController.close(Strings.MENU_ID);
      }
    }
  }

  function setValue(value: string) {
    setValueSelected(value);
    setOpenSelect(false);
    if (value === 'PT-BR') {
      if (onboardingFirstAccess) history.push(paths.ONBOARDING);
      else history.push(paths.RECORDERAREA);
    } else {
      history.push(paths.HOME);
    }
    if (buttonMenu.current) {
      buttonMenu.current.click();
    }
    menuController.close(Strings.MENU_ID);
  }

  const domain = useSelector(({ video }: RootState) => video.domain);
  const current = useSelector((state: RootState) => state.regionalism.current);

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
      onClick={e => navLink(e, tab)}
    >
      <IconComponent
        color={selectable ? getColor(tab, location.pathname) : DEFAULT_COLOR}
      />
      <span className="drawer-menu-item-label">{title}</span>

      {title === Strings.TITLE_MENU_TRANSLATOR && env.videoTranslator && (
        <>
          <button
            className="drawer-menu-sub-item translator"
            onClick={() => setOpenSelect(true)}
            type="button"
          >
            {valueSelected || 'Libras'}
          </button>
          <div className="arrow-down"> </div>
        </>
      )}
      {title === Strings.TITLE_MENU_DOMAIN && (
        <>
          <p className="drawer-menu-sub-item"> {domain} </p>
          <div className="arrow-down"> </div>
        </>
      )}
      {title === Strings.TITLE_MENU_REGIONALISM && (
        <>
          <p className="drawer-menu-sub-item">
            {RegionalismArray.find(item => item.name === current)?.abbreviation}
          </p>
          <div className="arrow-down"> </div>
        </>
      )}
    </IonItem>
  );

  return (
    // <IonMenuToggle>
    <IonMenu side="start" menuId={Strings.MENU_ID} contentId={contentId}>
      <IonHeader className="drawer-menu-container" mode="ios">
        <div className="drawer-menu-header-logo">
          <IonImg className="drawer-menu-image-header" src={Vlibraslogo} />
          <IonLabel className="drawer-menu-header-label">
            {Strings.HEADER_VLIBRAS_LABEL}
          </IonLabel>
        </div>
        <IonMenuButton autoHide ref={buttonMenu} style={{ display: 'none' }} />
        {openSelect && (
          <div className="dropdown-trans-picker">
            <button
              className={
                valueSelected === 'Libras' || valueSelected === ''
                  ? 'option-trans selected'
                  : 'option-trans'
              }
              onClick={() => setValue('Libras')}
              type="button"
            >
              Libras
            </button>
            <button
              className={
                valueSelected === 'PT-BR'
                  ? 'option-trans selected'
                  : 'option-trans'
              }
              onClick={() => setValue('PT-BR')}
              type="button"
            >
              PT-BR
            </button>
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
          {renderItemTab(
            paths.CUSTOMIZATION,
            Strings.TITLE_MENU_CUSTOMIZATION,
            IconCustomization,
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
            IconInfo,
            false,
          )}
        </IonList>
      </div>
    </IonMenu>
    // </IonMenuToggle>
  );
}

export default DrawerMenu;
