/* eslint-disable max-len */
import React from 'react';
import { SVGProps } from './types';

const IconEmotions = ({
  style = {},
  color = '#4B4B4B',
  size = 24,
  viewBox = '0 0 24 24',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={style}
  >
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" />
    <circle cx="8" cy="10" r="1.5" fill={color} />
    <circle cx="16" cy="10" r="1.5" fill={color} />
    <path
      d="M8 15c1.5 2 6.5 2 8 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export default IconEmotions;
