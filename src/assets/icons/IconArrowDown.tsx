import React from 'react';

import { SVGProps } from './types';

function IconArrowDown(props: SVGProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      viewBox="0 0 512 512"
      {...props}>
      <path
        fill="none"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={96}
        d="m112 268l144 144l144-144M256 392V100"></path>
    </svg>
  );
}

export default IconArrowDown;
