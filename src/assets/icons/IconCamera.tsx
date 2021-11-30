import React from 'react';

import { SVGProps } from './types';

const IconCamera = ({
  style = {},
  color = 'white',
  size = 21,
  viewBox = '0 0 20 21',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="20" transform="translate(0 0.5)" fill="#1447A6" />
    <path
      d="M19 15.8333C19 16.2754 18.8276 16.6993 18.5207 17.0118C18.2138 17.3244 17.7976 17.5 17.3636 17.5H2.63636C2.20237 17.5 1.78616 17.3244 1.47928 17.0118C1.1724 16.6993 1 16.2754 1 15.8333V6.66667C1 6.22464 1.1724 5.80072 1.47928 5.48816C1.78616 5.17559 2.20237 5 2.63636 5H5.90909L7.54546 2.5H12.4545L14.0909 5H17.3636C17.7976 5 18.2138 5.17559 18.5207 5.48816C18.8276 5.80072 19 6.22464 19 6.66667V15.8333Z"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      stroke={color}
    />
    <circle cx="10" cy="10.5" r="3" stroke={color} />
  </svg>
);

export default IconCamera;
