import React from 'react';
import { IonItem, IonImg, IonText, IonRadio } from '@ionic/react';

const RadioItem = ({ item, isSelected, onRadioChange }) => {
  return (
    <IonItem className="regionalism-item" onClick={() => onRadioChange(item.name)}>
      <IonImg src={item.url} />
      <IonText className="regionalism-text">{item.name}</IonText>
      <IonRadio slot="end" checked={isSelected} />
    </IonItem>
  );
};

export default RadioItem;