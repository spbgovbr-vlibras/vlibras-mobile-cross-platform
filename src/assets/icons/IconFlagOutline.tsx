/* eslint-disable max-len */
import React from 'react';
import { IonIcon } from '@ionic/react';
import { flagOutline } from 'ionicons/icons';

import { SVGProps } from './types';

const IconFlagOutline = ({
  style = {},
  color = '#4B4B4B',
  size = 24,
}: SVGProps) => (
  <IonIcon
    icon={flagOutline}
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

export default IconFlagOutline;
