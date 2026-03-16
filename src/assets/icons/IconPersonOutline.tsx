/* eslint-disable max-len */
import React from 'react';
import { IonIcon } from '@ionic/react';
import { personOutline } from 'ionicons/icons';

import { SVGProps } from './types';

const IconPersonOutline = ({
  style = {},
  color = '#4B4B4B',
  size = 24,
}: SVGProps) => (
  <IonIcon
    icon={personOutline}
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

export default IconPersonOutline;
