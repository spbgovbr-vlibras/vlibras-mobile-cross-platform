import React from 'react';

import { SVGProps } from './types';

const IconBody = ({
  style = {},
  color = 'gray',
  size = 24,
  viewBox = '0 0 23 23',
}: SVGProps) => (
  <svg
    width="9"
    height="24"
    viewBox="0 0 9 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.5 0C6.15684 0 7.5 1.34316 7.5 3C7.5 4.65684 6.15684 6 4.5 6C2.84316 6 1.5 4.65684 1.5 3C1.5 1.34316 2.84316 0 4.5 0ZM6.75 6.75H6.2175C5.15292 7.23952 3.89297 7.26066 2.7825 6.75H2.25C1.00734 6.75 0 7.75734 0 9V15.375C0 15.9963 0.503672 16.5 1.125 16.5H1.875V22.875C1.875 23.4963 2.37867 24 3 24H6C6.62133 24 7.125 23.4963 7.125 22.875V16.5H7.875C8.49633 16.5 9 15.9963 9 15.375V9C9 7.75734 7.99266 6.75 6.75 6.75Z"
      fill={color}
    />
  </svg>
);

export default IconBody;
