/* eslint-disable max-len */
import React from 'react';
import { IonIcon } from '@ionic/react';
import { timeOutline } from 'ionicons/icons';

import { SVGProps } from './types';

const IconTimeOutline = ({
  style = {},
  color = '#4B4B4B',
  size = 24,
}: SVGProps) => (
  <IonIcon
    icon={timeOutline}
    style={{
      color,
      width: size,
      height: size,
      minWidth: size,
      minHeight: size,
      ...style,
    }}
  />
);

export default IconTimeOutline;
