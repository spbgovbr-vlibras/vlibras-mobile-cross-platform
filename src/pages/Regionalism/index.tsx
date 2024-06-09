import { RadioGroupChangeEventDetail } from '@ionic/core/components';
import {
  IonContent,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonText,
  IonFooter,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonSpinner,
} from '@ionic/react';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';

import { ErrorModal, LoadingModal } from 'components';
import EmptyRegionalismModal from 'components/EmptyRegionalismModal';
import RadioItem from 'components/RadioItem'; // TODO
import regionalismData from 'data/regionalism';
import { fetchBundles } from 'services/regionalism';
import UnityService from 'services/unity';
import { RootState } from 'store';
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
  const [isLoading, setIsLoading] = useState(false);
  const [currentRegion, setCurrentRegion] = useState(currentRegionalism);
  const [showModal, setShowModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalOpen, setOpenModal] = useState(false);

  const closeLoadedModal = useCallback(() => {
    setOpenModal(false);
  }, [setOpenModal]);

  const openLoadedModal = useCallback(() => {
    setOpenModal(true);
    setTimeout(() => {
      closeLoadedModal();
      history.goBack();
    }, 2000);
  }, [setOpenModal, closeLoadedModal, history]);

  useEffect(() => {
    if (isEmpty > 0) {
      history.goBack();
    }
  }, [isEmpty, history]);

  const handleOpenEmptyRegionalismModal = () => {
    setShowModal(true);
  };

  const handleOpenErrorRegionalismModal = () => {
    setShowErrorModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  function handleOnChange(evt: CustomEvent<RadioGroupChangeEventDetail>) {
    const current = regionalismData.find(
      (item) => item.name === evt.detail.value
    );
    if (current) {
      setCurrentRegion({
        name: current.name,
        abbreviation: current.abbreviation,
        url: current.url,
      });
    }
  }

  const handleCustomRadioChange = (value: string) => {
    const current = regionalismData.find((item) => item.name === value);
    if (current) {
      setCurrentRegion({
        name: current.name,
        abbreviation: current.abbreviation,
        url: current.url,
      });
    }
  };

  const regionalismDataDefault = {
    name: 'BR - Padrão Nacional',
    abbreviation: 'BR',
    url: regionalismData[0].url,
  };

  function defaultRegion() {
    setCurrentRegion(regionalismDataDefault);
    UnityService.getPlayerInstance().setPlayerRegion('BR');
    dispatch(Creators.setCurrentRegionalism(regionalismDataDefault));
  }

  async function SaveRegionalism() {
    setIsLoading(true);
    try {
      const bundles = await fetchBundles(currentRegion.abbreviation);
      if (bundles.length > 0) {
        UnityService.getPlayerInstance().setPlayerRegion(
          currentRegion.abbreviation
        );
        openLoadedModal();
        dispatch(Creators.setCurrentRegionalism(currentRegion));
      } else {
        defaultRegion();
        handleOpenEmptyRegionalismModal();
      }
      isEmpty = bundles.length;
    } catch (error: unknown) {
      closeLoadedModal();
      handleOpenErrorRegionalismModal();
    }
    setIsLoading(false);
  }

  return (
    <IonPage>
      <EmptyRegionalismModal isOpen={showModal} onClose={handleCloseModal} />
      <ErrorModal
        show={showErrorModal}
        setShow={setShowErrorModal}
        errorMsg={Strings.REGIONALISM_ERROR}
      />
      <LoadingModal
        loading={modalOpen}
        setLoading={setOpenModal}
        text=""
        canDismiss={false}
      />
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title">
            {Strings.REGIONALISM_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="var(--VLibras---Light-Black-1, #363636)" />
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
            <IonRadioGroup
              value={currentRegion.name}
              onIonChange={handleOnChange}>
              {regionalismData.map((item) => (
                <RadioItem
                  key={item.name}
                  item={item}
                  isSelected={currentRegion.name === item.name}
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
            style={{ width: 100 }}
            className="regionalism-cancel"
            onClick={() => history.goBack()}
            type="button">
            {Strings.BUTTON_CANCEL}
          </button>
          <button
            style={{ width: 100 }}
            type="button"
            disabled={isLoading}
            className="regionalism-save"
            onClick={() => SaveRegionalism()}>
            {isLoading ? (
              <IonSpinner className="custom-spinner" name="circles" />
            ) : (
              Strings.BUTTON_SAVE
            )}
          </button>
        </div>
      </IonFooter>
    </IonPage>
  );
}
export default Regionalism;
