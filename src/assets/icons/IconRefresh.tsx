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
    style={style}
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
        d="M3.50988 15.0001C4.15827 16.8404 5.38721 18.4203 7.01153 19.5014C8.63586 20.5826 10.5676 21.1067 12.5156 20.9945C14.4636 20.8824 16.3225 20.1402 17.812 18.8798C19.3016 17.6194 20.3411 15.909 20.7741 14.0064C21.2071 12.1038 21.01 10.112 20.2125 8.33117C19.415 6.55031 18.0604 5.07687 16.3527 4.13284C14.645 3.18881 12.6768 2.82533 10.7446 3.09719C8.81233 3.36904 7.02079 4.26149 5.63988 5.64007L0.999878 10.0001"
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
