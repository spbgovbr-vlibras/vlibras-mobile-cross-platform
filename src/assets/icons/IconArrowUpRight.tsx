import React from 'react';

import { SVGProps } from './types';

const IconArrowUpRight = ({
  style = {},
  color = 'black',
  size = 16,
  viewBox = '0 0 16 16',
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
      d="M4.66675 11.3333L11.3334 4.66663"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4.66675 4.66663H11.3334V11.3333"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconArrowUpRight;
