import { RadioGroupChangeEventDetail } from '@ionic/core/components';
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
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { LoadingModal } from 'components';
import EmptyRegionalismModal from 'components/EmptyRegionalismModal';
import RadioItem from 'components/RadioItem'; // TODO
import regionalismData from 'data/regionalism';
import { fetchBundles } from 'services/regionalism';
import UnityService from 'services/unity';
import { RootState } from 'store';
import { getRegionalismAbbreviation } from 'store/ducks/dictionary';
import { Creators } from 'store/ducks/regionalism';

import { Strings } from './strings';
import { IconArrowLeft } from '../../assets';
import './styles.css';

export interface RegionalismItem {
  name: string;
  url: any;
}

function Regionalism() {
  const dispatch = useDispatch();
  const history = useHistory();
  let isEmpty = 0;

  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );
  const [regionalism, setregionalism] = useState(currentRegionalism);
  const [abbreviation, setAbbreviation] = useState<string>(
    regionalismData.find((item) => item.name === regionalism)?.abbreviation ?? ''
  );
  const [showModal, setShowModal] = useState(false);
  const [modalOpen, setOpenModal] = useState(false);

  const closeLoadingModal = useCallback(() => {
    setOpenModal(false);
  }, [setOpenModal]);

  const openLoadingModal = useCallback(() => {
    setOpenModal(true);
    setTimeout(() => {
      closeLoadingModal();
      history.goBack();
    }, 2000);
  }, [setOpenModal, closeLoadingModal, history]);

  useEffect(() => {
    if (isEmpty > 0) {
      history.goBack();
    }
  }, [isEmpty, history]);

  const handleOpenEmptyRegionalismModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const renderItem = (item: RegionalismItem) => (
    <IonItem className="regionalism-item">
      <IonImg src={item.url} />
      <IonText className="regionalism-text">{item.name}</IonText>
      <IonRadio slot="end" value={item.name} />
    </IonItem>
  );

  function handleOnChange(evt: CustomEvent<RadioGroupChangeEventDetail>) {
    const abbr = regionalismData.find((item) => item.name === evt.detail.value)
      ?.abbreviation as string;
    setregionalism(evt.detail.value);
    setAbbreviation(abbr);
  }

  const handleCustomRadioChange = (value: any) => {
    setregionalism(value);
    const abbr = regionalismData.find((item) => item.name === value)
      ?.abbreviation as string;
    setAbbreviation(abbr);
  };

  async function SaveRegionalism() {
    try {
      const bundles = await fetchBundles(abbreviation);
      if (bundles.length > 0) {
        UnityService.getService().setPlayerRegion(abbreviation);
        openLoadingModal();
      }
      if (bundles.length <= 0) {
        handleOpenEmptyRegionalismModal();
      }
      isEmpty = bundles.length;
      dispatch(Creators.setCurrentRegionalism(regionalism));
    } catch (error: unknown) {
      closeLoadingModal();
      handleOpenEmptyRegionalismModal();
    }
    getRegionalismAbbreviation(abbreviation);
  }

  return (
    <IonPage>
      <EmptyRegionalismModal isOpen={showModal} onClose={handleCloseModal} />
      <LoadingModal
        loading={modalOpen}
        setLoading={setOpenModal}
        text=""
        canDismiss={false}
      />
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.REGIONALISM_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent slot="right">
        <div className="regionalism-list">
          <IonList lines="none">
            <IonListHeader>
              <IonText className="regionalism-infobasic">
                {Strings.INFO_BASIC}
              </IonText>
            </IonListHeader>
            <IonRadioGroup value={regionalism} onIonChange={handleOnChange}>
              {regionalismData.map((item) => (
                <RadioItem
                  key={item.name}
                  item={item}
                  isSelected={regionalism === item.name}
                  onRadioChange={handleCustomRadioChange}
                />
              ))}
            </IonRadioGroup>
          </IonList>
        </div>
      </IonContent>
      <IonFooter style={{ background: 'white' }}>
        <div className="regionalism-icon-save">
          <button
            className="regionalism-cancel"
            onClick={() => history.goBack()}
            type="button">
            {Strings.BUTTON_CANCEL}
          </button>
          <button
            type="button"
            className="regionalism-save"
            onClick={() => SaveRegionalism()}>
            {Strings.BUTTON_SAVE}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
}
export default Regionalism;
