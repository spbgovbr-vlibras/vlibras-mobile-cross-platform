import { IonSpinner, IonText, IonLabel } from '@ionic/react';
import React from 'react';

interface LoadingSpinnerProps {
  loadingDescription: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  loadingDescription,
}) => {
  return (
    <div style={spinnerStyle}>
      <IonSpinner color="primary" name="bubbles" style={spinnerIconStyle} />
      <IonLabel>
        <IonText color="dark" style={spinnerTextStyle}>
          {loadingDescription}
        </IonText>
      </IonLabel>
    </div>
  );
};

// Style objects to make the spinner and text align similar to IonInfiniteScrollContent
const spinnerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  height: '60px',
  justifyContent: 'center',
};

const spinnerIconStyle: React.CSSProperties = {
  width: '28px',
  height: '28px',
};

const spinnerTextStyle: React.CSSProperties = {
  marginTop: '15px',
};

export default LoadingSpinner;
