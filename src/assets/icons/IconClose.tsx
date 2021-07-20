import React from 'react';

import { SVGProps } from './types';

const IconClose = ({
  style = {},
  color = 'black',
  size = 24,
  viewBox = '0 0 29 29',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M21.4998 21.5003L7.35564 7.35608"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.4998 7.35608L7.35564 21.5003"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconClose;
