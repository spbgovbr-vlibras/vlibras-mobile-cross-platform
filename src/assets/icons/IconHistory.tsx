import React from 'react';

import { SVGProps } from './types';

const IconHistory = ({
  style = {},
  color = 'black',
  size = 32,
  viewBox = '0 0 32 32',
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
      d="M17.3334 4C10.7067 4 5.33338 9.37333 5.33338 16H1.33338L6.52005 21.1867L6.61338 21.3733L12 16H8.00005C8.00005 10.84 12.1734 6.66667 17.3334 6.66667C22.4934 6.66667 26.6667 10.84 26.6667 16C26.6667 21.16 22.4934 25.3333 17.3334 25.3333C14.76 25.3333 12.4267 24.28 10.7467 22.5867L8.85338 24.48C11.0267 26.6533 14.0134 28 17.3334 28C23.96 28 29.3334 22.6267 29.3334 16C29.3334 9.37333 23.96 4 17.3334 4ZM16 10.6667V17.3333L21.7067 20.72L22.6667 19.1067L18 16.3333V10.6667H16Z"
      fill={color}
    />
  </svg>
);

export default IconHistory;
