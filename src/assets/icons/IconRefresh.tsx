import React from 'react';

import { SVGProps } from './types';

const IconRefresh = ({
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
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0)">
      <path
        d="M0.999878 4V10H6.99988"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.50988 14.9999C4.15827 16.8403 5.38721 18.4201 7.01153 19.5013C8.63586 20.5825 10.5676 21.1065 12.5156 20.9944C14.4636 20.8823 16.3225 20.1401 17.812 18.8797C19.3016 17.6193 20.3411 15.9089 20.7741 14.0063C21.2071 12.1037 21.01 10.1119 20.2125 8.33105C19.415 6.55019 18.0604 5.07674 16.3527 4.13271C14.645 3.18868 12.6768 2.82521 10.7446 3.09707C8.81233 3.36892 7.02079 4.26137 5.63988 5.63995L0.999878 9.99995"
        stroke={color}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width={size} height={size} fill={color} />
      </clipPath>
    </defs>
  </svg>
);

export default IconRefresh;
