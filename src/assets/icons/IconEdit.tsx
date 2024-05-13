/* eslint-disable max-len */
import React from 'react';

import { SVGProps } from './types';

const IconEdit = ({
  style = {},
  color = 'black',
  size = 30,
  viewBox = '3 10 40 30',
}: SVGProps) => (
  <svg
    width='50'
    height='50'
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M15.3017 32.6986H16.9126L26.8371 22.774L25.2262 21.163L15.3017 31.0877V32.6986ZM31.7562 21.1055L26.8659 16.2726L28.4768 14.6616C28.9179 14.2205 29.4598 14 30.1027 14C30.7455 14 31.2871 14.2205 31.7274 14.6616L33.3383 16.2726C33.7794 16.7137 34.0096 17.2461 34.0287 17.8698C34.0479 18.4934 33.837 19.0254 33.3959 19.4658L31.7562 21.1055ZM30.0877 22.8027L17.8907 35H13.0004V30.1096L25.1974 17.9123L30.0877 22.8027ZM26.0316 21.9685L25.2262 21.163L26.8371 22.774L26.0316 21.9685Z"
      fill="#FDFDFD"
    />
  </svg>
);

export default IconEdit;
