/* eslint-disable max-len */
import React from 'react';

import { SVGProps } from './types';

const IconInfo = ({
  style = {},
  color = '#363636',
  size = 38,
  viewBox = '0 0 24 24',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill={color} />
    <path
      d="M12 7C11.4477 7 11 7.44772 11 8C11 8.55228 11.4477 9 12 9C12.5523 9 13 8.55228 13 8C13 7.44772 12.5523 7 12 7Z"
      fill="white"
    />
    <rect x="11" y="10" width="2" height="8" rx="1" fill="white" />
  </svg>
);

export default IconInfo;
