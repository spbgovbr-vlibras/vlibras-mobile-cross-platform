import React from 'react';

import { SVGProps } from './types';

const IconPause = ({
  style = {},
  color = 'black',
  size = 24,
  viewBox = '0 0 24 24',
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
      d="M10 18V6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6V18C6 19.1046 6.89543 20 8 20C9.10457 20 10 19.1046 10 18Z"
      fill={color}
    />
    <path
      d="M18 18V6C18 4.89543 17.1046 4 16 4C14.8954 4 14 4.89543 14 6V18C14 19.1046 14.8954 20 16 20C17.1046 20 18 19.1046 18 18Z"
      fill={color}
    />
  </svg>
);

export default IconPause;
