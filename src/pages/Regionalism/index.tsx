import React, { useState, useCallback } from 'react';

// 1. Bibliotecas Externas
import { RadioGroupChangeEventDetail } from '@ionic/core';
import {
  IonContent,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonItem,
  IonRadio,
  IonText,
  IonImg,
  IonFooter,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

// 2. Dados e Estado (Store)
import regionalismData from 'data/regionalism';
import { RootState } from 'store';
import { Creators as RegionalismCreators } from 'store/ducks/regionalism';

// 3. Assets e Componentes Internos
import { Strings } from './strings';
import { IconArrowLeft } from '../../assets';

// 4. Módulos Locais e Estilos
import './styles.css';

// Interface exportada permanece a mesma
export interface RegionalismItem {
  name: string;
  url: any;
}

function Regionalism() {
  // --- Hooks ---
  const dispatch = useDispatch();

  const history = useHistory();

  const currentRegionalism = useSelector(
    (state: RootState) => state.regionalism.current
  );

  const [selectedRegionalism, setSelectedRegionalism] =
    useState(currentRegionalism);

  // --- Handlers Memoizados (Correção para 'jsx-no-bind') ---

  // Função para voltar à página anterior
  const handleGoBack = useCallback(() => {
    history.goBack();
  }, [history]);

  // Função para salvar o regionalismo escolhido
  const handleSave = useCallback(() => {
    dispatch(RegionalismCreators.setCurrentRegionalism(selectedRegionalism));
    history.goBack();
  }, [dispatch, history, selectedRegionalism]);

  // Função para lidar com a mudança no RadioGroup
  const handleOnChange = useCallback(
    (evt: CustomEvent<RadioGroupChangeEventDetail>) => {
      setSelectedRegionalism(evt.detail.value);
    },
    [] // Sem dependências, pois a função não usa nada de fora de seu escopo
  );

  // --- Render Functions Memoizadas ---

  // Função para renderizar cada item da lista
  const renderItem = useCallback(
    (item: RegionalismItem) => (
      <IonItem class="regionalism-item" key={item.name}>
        <IonImg src={item.url} />
        <IonText class="regionalism-text">{item.name}</IonText>
        <IonRadio slot="end" value={item.name} />
      </IonItem>
    ),
    []
  ); // Sem dependências, renderização pura baseada nos props

  // --- Renderização do Componente ---
  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.REGIONALISM_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={handleGoBack}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="regionalism-list">
          <IonList lines="none">
            <IonListHeader>
              <IonText class="regionalism-infobasic">
                {Strings.INFO_BASIC}
              </IonText>
            </IonListHeader>
            <IonRadioGroup
              value={selectedRegionalism}
              onIonChange={handleOnChange}>
              {regionalismData.map(renderItem)}
            </IonRadioGroup>
          </IonList>
        </div>
      </IonContent>
      <IonFooter style={{ background: 'white' }}>
        <div className="regionalism-icon-save">
          <button
            className="regionalism-cancel"
            onClick={handleGoBack}
            type="button">
            {Strings.BUTTON_CANCEL}
          </button>
          <button
            type="button"
            className="regionalism-save"
            onClick={handleSave}>
            {Strings.BUTTON_SAVE}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
}

export default Regionalism;
