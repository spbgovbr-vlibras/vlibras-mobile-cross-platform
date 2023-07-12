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
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';

import RegionalismModal from 'components/RegionalismModal';
import regionalismData from 'data/regionalism';
import { fetchBundles } from 'services/regionalism';
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
  const location = useLocation();
  const history = useHistory();
  let isEmpty = 0;

  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );
  const [regionalism, setregionalism] = useState(currentRegionalism);
  const [abbreviation, setAbbreviation] = useState<string>('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isEmpty > 0) {
      history.goBack();
    }
  }, [isEmpty, history]);

  const handleOpenModal = () => {
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

  async function SaveRegionalism() {
    await fetchBundles(abbreviation).then((res) => {
      if (res.length > 0) {
        history.goBack();
      }
      if (res.length <= 0) {
        handleOpenModal();
      }
      isEmpty = res.length;
    });
    dispatch(Creators.setCurrentRegionalism(regionalism));
  }

  return (
    <IonPage>
      <RegionalismModal isOpen={showModal} onClose={handleCloseModal} />
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
              {regionalismData.map((item) => renderItem(item))}
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
