/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable import/order */
import React, { useEffect, useState, useRef } from 'react';

import { menuController } from '@ionic/core/components';
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

import { Strings } from './strings';

import './styles.css';
import IconDictionary2 from 'assets/icons/IconDictionary2';
import IconEmotions from 'assets/icons/IconEmotions';
import { PlayerKeys } from 'constants/player';
import UnityService from 'services/unity';

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
  const isLoadingAction = useSelector(({ loading }: RootState) => loading.isLoading);
  const isVideoScreen = useSelector(({ video }: RootState) => video.isVideoScreen);
  const onboardingFirstAccess = useSelector(({ video }: RootState) => video.onboardingFirstAccess);
  const domain = useSelector(({ video }: RootState) => video.domain);
  const current = useSelector((state: RootState) => state.regionalism.current);

  const [openSelect, setOpenSelect] = useState(false);
  const [valueSelected, setValueSelected] = useState<string>('');

  const [selectedEmotion, setSelectedEmotion] = useState<string>('Neutra');
  const [openEmotionDropdown, setOpenEmotionDropdown] = useState<boolean>(false);

  const buttonMenu = useRef<any>(null);
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    if (isVideoScreen) {
      setValueSelected('PT-BR');
    } else {
      setValueSelected('Libras');
    }
  }, [isVideoScreen]);

  function navLink(e: any, path: string) {
    if (e.target.className === 'drawer-menu-sub-item translator') {
      setOpenSelect(!openSelect);
    } else {
      if (path === paths.HOME) {
        if (valueSelected === 'PT-BR') {
          history.push(paths.RECORDERAREA);
        } else {
          history.push(path);
        }
        if (buttonMenu.current) buttonMenu.current.click();
        menuController.close(Strings.MENU_ID);
        setOpenSelect(false);
      } else {
        history.push(path);
        if (buttonMenu.current) buttonMenu.current.click();
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
    if (buttonMenu.current) buttonMenu.current.click();
    menuController.close(Strings.MENU_ID);
  }

  function applyEmotion(emotionKey: PlayerKeys) {
    UnityService.getPlayerInstance().send(
      PlayerKeys.EMOTION_BRIDGE,
      emotionKey
    );
  }
  

  const renderItemTab = (
    tab: string,
    title: string,
    IconComponent: React.ComponentType<SVGProps>,
    selectable: boolean
  ) => (
    <IonItem
      className={selectable ? getClassName(tab, location.pathname) : CLASS_NAME_MENU}
      detail={false}
      onClick={(e) => {
        if (title !== Strings.TITLE_MENU_EMOTIONS) navLink(e, tab);
      }}>
      <IconComponent color={selectable ? getColor(tab, location.pathname) : DEFAULT_COLOR} />
      <span className="drawer-menu-item-label">{title}</span>

      {title === Strings.TITLE_MENU_TRANSLATOR && env.videoTranslator && (
        <>
          <button
            className="drawer-menu-sub-item translator"
            onClick={() => setOpenSelect(true)}
            type="button">
            {valueSelected || 'Libras'}
          </button>
          <div className="arrow-down" />
        </>
      )}
      {title === Strings.TITLE_MENU_DOMAIN && (
        <>
          <p className="drawer-menu-sub-item">{domain}</p>
          <div className="arrow-down" />
        </>
      )}
      {title === Strings.TITLE_MENU_REGIONALISM && (
        <>
          <p className="drawer-menu-sub-item">{current.abbreviation}</p>
          <div className="arrow-down" />
        </>
      )}
      {title === Strings.TITLE_MENU_EMOTIONS && (
        <>
          <p
            className="drawer-menu-sub-item emotion-picker"
            onClick={(e) => {
              e.stopPropagation();
              setOpenEmotionDropdown(!openEmotionDropdown);
            }}
          >
            {selectedEmotion}
          </p>
          <div className="arrow-down" />
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
        <IonMenuButton autoHide ref={buttonMenu} style={{ display: 'none' }} />
        {openSelect && (
          <div className="dropdown-trans-picker">
            <button
              className={valueSelected === 'Libras' || valueSelected === '' ? 'option-trans selected' : 'option-trans'}
              onClick={() => setValue('Libras')}
              type="button">
              Libras
            </button>
            <button
              className={valueSelected === 'PT-BR' ? 'option-trans selected' : 'option-trans'}
              onClick={() => setValue('PT-BR')}
              type="button">
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
          {renderItemTab(paths.HOME, Strings.TITLE_MENU_TRANSLATOR, IconTranslate, true)}
          {renderItemTab(paths.DICTIONARY, Strings.TITLE_MENU_DICTIONARY, IconDictionary2, true)}
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
            ? renderItemTab(paths.DOMAIN, Strings.TITLE_MENU_DOMAIN, IconDomain, true)
            : renderItemTab(paths.REGIONALISM, Strings.TITLE_MENU_REGIONALISM, IconRegionalism, true)}
          {!isLoadingAction &&
            renderItemTab(paths.CUSTOMIZATION, Strings.TITLE_MENU_CUSTOMIZATION, IconCustomization, true)}
          {renderItemTab(paths.EMOTIONS, Strings.TITLE_MENU_EMOTIONS, IconEmotions, true)}
        </IonList>
        <IonList lines="none">
          {renderItemTab(paths.TUTORIAL, Strings.TITLE_MENU_TUTORIAL, IconTutorial, false)}
          {renderItemTab(paths.ABOUT, Strings.TITLE_MENU_ABOUT, IconInfo, false)}
        </IonList>
        {openEmotionDropdown && (
  <div className="dropdown-emotion-picker floating-emotion">
    {['Neutra', 'Feliz', 'Triste'].map((emotion) => {
      const icons: Record<string, string> = {
        Neutra: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0F449C"><path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520Zm50 180h180q13 0 21.5-8.5T600-370q0-13-8.5-21.5T570-400H390q-13 0-21.5 8.5T360-370q0 13 8.5 21.5T390-340Zm90 260q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>`,
        Feliz: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0F449C"><path d="M620-520q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-100q58 0 107-28t79-76q6-12-1-24t-21-12H316q-14 0-21 12t-1 24q30 48 79.5 76T480-260Z"/></svg>`,
        Triste: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#0f449c"><path d="M480-420q-54 0-101.5 23.5T302-328q-11 16-3 32t26 16q8 0 14.5-3.5T351-294q23-31 57-48.5t72-17.5q38 0 72 17.5t57 48.5q4 7 10.5 10.5T634-280q18 0 26-16.5t-3-33.5q-29-44-76.5-67T480-420Zm140-100q25 0 42.5-17.5T680-580q0-25-17.5-42.5T620-640q-25 0-42.5 17.5T560-580q0 25 17.5 42.5T620-520Zm-280 0q25 0 42.5-17.5T400-580q0-25-17.5-42.5T340-640q-25 0-42.5 17.5T280-580q0 25 17.5 42.5T340-520ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-400Zm0 320q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Z"/></svg>`
      };

      return (
        <button
          key={emotion}
          className={`emotion-option ${selectedEmotion === emotion ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            setSelectedEmotion(emotion);
            setOpenEmotionDropdown(false);

            switch (emotion) {
              case 'Neutra':
                applyEmotion(PlayerKeys.APPLY_DEFAULT_EMOTION);
                break;
              case 'Feliz':
                applyEmotion(PlayerKeys.APPLY_HAPPY_EMOTION);
                break;
              case 'Triste':
                applyEmotion(PlayerKeys.APPLY_SAD_EMOTION);
                break;
            }
          }}
        >
          {icons[emotion] && (
            <span
              dangerouslySetInnerHTML={{ __html: icons[emotion] }}
              style={{ marginRight: 8 }}
            />
          )}
          {emotion}
        </button>
      );
    })}
  </div>
)}


      </div>
    </IonMenu>
  );
}

export default DrawerMenu;