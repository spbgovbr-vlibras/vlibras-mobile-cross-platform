import React from 'react';

import { SVGProps } from './types';

const IconYoutube = ({
  style = {},
  color = 'black',
  size = 24,
  viewBox = '0 0 24 24',
}: SVGProps) => (
  <svg
    style={style}
    width="24"
    height="24"
    viewBox="0 0 24 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M24 5.92213C24 3.06248 21.6398 0.75 18.7359 0.75H5.26409C2.35359 0.75 0 3.06899 0 5.92213V12.0779C0 14.9375 2.36022 17.25 5.26409 17.25H18.7293C21.6398 17.25 23.9934 14.931 23.9934 12.0779V5.92213H24ZM16.0773 9.45924L10.0376 12.397C9.79889 12.5208 8.99669 12.3515 8.99669 12.0909V6.06544C8.99669 5.79837 9.80552 5.629 10.0442 5.75928L15.8254 8.84692C16.0707 8.98371 16.3227 9.32896 16.0773 9.45924Z"
      fill={color}
    />
  </svg>
);

export default IconYoutube;
