import React from 'react';

import { SVGProps } from './types';

const IconClose = ({
  style = {},
  color = 'black',
  size = 24,
  viewBox = '0 0 29 29',
}: SVGProps) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M19 12H5"
      stroke="#315EB1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12 19L5 12L12 5"
      stroke="#315EB1"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export default IconClose;
