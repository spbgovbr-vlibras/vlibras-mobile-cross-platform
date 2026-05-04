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
  IconHandsTranslate,
  IconDomain,
  IconHistory,
  Vlibraslogo,
} from 'assets';
import { SVGProps } from 'assets/icons/types';
import paths from 'constants/paths';

import { useTranslation } from 'hooks/Translation';
import { Strings } from './strings';

import './styles.css';
import IconDictionary2 from 'assets/icons/IconDictionary2';
import IconEmotions from 'assets/icons/IconEmotions';
import IconFlagOutline from 'assets/icons/IconFlagOutline';
import IconPersonOutline from 'assets/icons/IconPersonOutline';
import { PlayerKeys } from 'constants/player';
import UnityService from 'services/unity';

interface DrawerMenuProps {
  contentId: string;
}

const CLASS_NAME_MENU = 'drawer-menu-item';
const CLASS_NAME_ACTIVED_MENU = `drawer-menu-item-activated ${CLASS_NAME_MENU}`;
const ACTIVED_COLOR = '#1447a6';
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
  const { selectedEmotion, setSelectedEmotion } = useTranslation();

  const [openSelect, setOpenSelect] = useState(false);
  const [valueSelected, setValueSelected] = useState<string>('');

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
    selectable: boolean,
    iconSize = 24
  ) => (
    <IonItem
      className={selectable ? getClassName(tab, location.pathname) : CLASS_NAME_MENU}
      detail={false}
      onClick={(e) => {
        if (title !== Strings.TITLE_MENU_EMOTIONS) navLink(e, tab);
      }}>
      <span slot="start" className="drawer-menu-icon-wrap">
        <IconComponent color={selectable ? getColor(tab, location.pathname) : DEFAULT_COLOR} size={iconSize} />
      </span>
      <IonLabel className="drawer-menu-item-label">{title}</IonLabel>
      {title === Strings.TITLE_MENU_TRANSLATOR && env.videoTranslator && (
        <span slot="end" className="drawer-menu-sub-wrap">
          <button
            className="drawer-menu-sub-item translator"
            onClick={() => setOpenSelect(true)}
            type="button">
            {valueSelected || 'Libras'}
          </button>
          <div className="arrow-down" />
        </span>
      )}
      {title === Strings.TITLE_MENU_DOMAIN && (
        <span slot="end" className="drawer-menu-sub-wrap">
          <p className="drawer-menu-sub-item">{domain}</p>
          <div className="arrow-down" />
        </span>
      )}
      {title === Strings.TITLE_MENU_REGIONALISM && (
        <span slot="end" className="drawer-menu-sub-wrap">
          <p className="drawer-menu-sub-item">{current.abbreviation}</p>
          <div className="arrow-down" />
        </span>
      )}
      {title === Strings.TITLE_MENU_EMOTIONS && (
        <span slot="end" className="drawer-menu-sub-wrap">
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
        </span>
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
          {renderItemTab(paths.HOME, Strings.TITLE_MENU_TRANSLATOR, IconHandsTranslate, true)}
          {renderItemTab(paths.DICTIONARY, Strings.TITLE_MENU_DICTIONARY, IconDictionary2, true)}
          {renderItemTab(paths.HISTORY, Strings.TITLE_MENU_HISTORY, IconHistory, true)}
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
            : renderItemTab(paths.REGIONALISM, Strings.TITLE_MENU_REGIONALISM, IconFlagOutline, true)}
          {!isLoadingAction &&
            renderItemTab(paths.CUSTOMIZATION, Strings.TITLE_MENU_CUSTOMIZATION, IconPersonOutline, true)}
          {renderItemTab(paths.EMOTIONS, Strings.TITLE_MENU_EMOTIONS, IconEmotions, true)}
        </IonList>
        {openEmotionDropdown && (
  <div className="dropdown-emotion-picker floating-emotion">
    {[/* 'Automático', */ 'Neutra', 'Feliz', 'Triste', 'Raiva', 'Desgosto', 'Medo', 'Surpresa'].map((emotion) => {
      const icons: Record<string, string> = {
        // COMENTADO PARA DEPLOY - Opção Automático removida temporariamente
        // Automático: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><path d="M0 0h24v24H0z" fill="none"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>`,
        Neutra: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><path d="M9 14h6v1.5H9z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
        Feliz: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
        Triste: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><path d="M12 17.5c-2.33 0-4.31-1.46-5.11-3.5h10.22c-.8 2.04-2.78 3.5-5.11 3.5z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`,
        Raiva: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M12,2C6.47,2,2,6.47,2,12c0,5.53,4.47,10,10,10s10-4.47,10-10C22,6.47,17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8 s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/><path d="M15.5,9.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S16.33,9.5,15.5,9.5z"/><path d="M8.5,9.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S9.33,9.5,8.5,9.5z"/><path d="M12,14c-1.48,0-2.75,0.81-3.45,2h6.89c-0.7-1.19-1.97-2-3.44-2z"/></g></g></g></svg>`,
        Desgosto: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z M7,14h10v1.5H7V14z"/></svg>`,
        Medo: `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z"/><circle cx="15.5" cy="9.5" r="1.25"/><circle cx="8.5" cy="9.5" r="1.25"/><path d="M12,13.5c-2.33,0-4.31,1.46-5.11,3.5h10.22C16.31,14.96,14.33,13.5,12,13.5z"/></g></g></svg>`,
        Surpresa: `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#0F449C"><circle cx="12" cy="16" r="2"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z"/></svg>`
      };

      return (
        <button
          key={emotion}
          className={`emotion-option ${selectedEmotion === emotion ? 'selected' : ''}`}
          onClick={(e) => {
            e.stopPropagation();

            const sentimentsMap: Record<string, PlayerKeys> = {
              Feliz: PlayerKeys.APPLY_HAPPY_EMOTION,
              Neutra: PlayerKeys.APPLY_DEFAULT_EMOTION,
              Triste: PlayerKeys.APPLY_SAD_EMOTION,
              Raiva: PlayerKeys.APPLY_ANGRY_EMOTION,
              Desgosto: PlayerKeys.APPLY_DISGUST_EMOTION,
              Medo: PlayerKeys.APPLY_FEAR_EMOTION,
              Surpresa: PlayerKeys.APPLY_SURPRISE_EMOTION,
            };

            setSelectedEmotion(emotion);
            setOpenEmotionDropdown(false);

            switch (emotion) {
              // COMENTADO PARA DEPLOY - Case Automático removido temporariamente
              // case 'Automático':
              //   // a lógica agora é tratada dentro do player
              //   break;
              case 'Neutra':
                applyEmotion(PlayerKeys.APPLY_DEFAULT_EMOTION);
                break;
              case 'Feliz':
                applyEmotion(PlayerKeys.APPLY_HAPPY_EMOTION);
                break;
              case 'Triste':
                applyEmotion(PlayerKeys.APPLY_SAD_EMOTION);
                break;
              case 'Raiva':
                applyEmotion(PlayerKeys.APPLY_ANGRY_EMOTION);
                break;
              case 'Desgosto':
                applyEmotion(PlayerKeys.APPLY_DISGUST_EMOTION);
                break;
              case 'Medo':
                applyEmotion(PlayerKeys.APPLY_FEAR_EMOTION);
                break;
              case 'Surpresa':
                applyEmotion(PlayerKeys.APPLY_SURPRISE_EMOTION);
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