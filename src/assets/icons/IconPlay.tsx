import React from 'react';

import { SVGProps } from './types';

const IconPlay = ({
  style = {},
  color = 'white',
  size = 24,
  viewBox = '0 0 24 24',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="#969696"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.6 17.4L16.8 12L9.6 6.6V17.4ZM12 0C5.376 0 0 5.376 0 12C0 18.624 5.376 24 12 24C18.624 24 24 18.624 24 12C24 5.376 18.624 0 12 0ZM12 21.6C6.708 21.6 2.4 17.292 2.4 12C2.4 6.708 6.708 2.4 12 2.4C17.292 2.4 21.6 6.708 21.6 12C21.6 17.292 17.292 21.6 12 21.6Z"
      fill="#969696"
    />
  </svg>
);

export default IconPlay;
