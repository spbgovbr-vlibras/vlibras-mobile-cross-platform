import React from 'react';

import { SVGProps } from './types';

const MicIcon = ({
  style = {},
  color = 'grey',
  size = 18,
  viewBox = '0 0 18 18',
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9 10.4999C10.245 10.4999 11.2425 9.49494 11.2425 8.24994L11.25 3.74994C11.25 2.50494 10.245 1.49994 9 1.49994C7.755 1.49994 6.75 2.50494 6.75 3.74994V8.24994C6.75 9.49494 7.755 10.4999 9 10.4999ZM12.975 8.24994C12.975 10.4999 11.07 12.0749 9 12.0749C6.93 12.0749 5.025 10.4999 5.025 8.24994H3.75C3.75 10.8074 5.79 12.9224 8.25 13.2899V15.7499H9.75V13.2899C12.21 12.9299 14.25 10.8149 14.25 8.24994H12.975Z"
      fill={color}
    />
  </svg>
);

export default MicIcon;
