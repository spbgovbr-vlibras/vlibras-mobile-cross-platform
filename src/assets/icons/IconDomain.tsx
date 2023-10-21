/* eslint-disable max-len */
import React from 'react';

import { SVGProps } from './types';

const IconDomain = ({
  style = {},
  color = '#4B4B4B',
  size = 24,
  viewBox = '0 0 24 23',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.5 0.403992L3 0.403992C1.3455 0.403992 8.76726e-09 1.64921 1.9548e-08 3.18039L7.81918e-08 11.5096C8.89725e-08 13.0408 1.3455 14.286 3 14.286L3 17.7565C3 18.0272 3.171 18.2743 3.4365 18.3867C3.537 18.4298 3.6435 18.4506 3.75 18.4506C3.9255 18.4506 4.0995 18.3937 4.2375 18.2826L9.2775 14.286L16.5 14.286C18.1545 14.286 19.5 13.0408 19.5 11.5096L19.5 3.18039C19.5 1.64921 18.1545 0.403992 16.5 0.403992ZM18 11.5096C18 12.2745 17.3265 12.8978 16.5 12.8978L9 12.8978C8.8215 12.8978 8.6475 12.9561 8.5125 13.0658L4.5 16.2475L4.5 13.5919C4.5 13.2087 4.164 12.8978 3.75 12.8978L3 12.8978C2.1735 12.8978 1.5 12.2745 1.5 11.5096L1.5 3.18039C1.5 2.41549 2.1735 1.79219 3 1.79219L16.5 1.79219C17.3265 1.79219 18 2.41549 18 3.18039L18 11.5096Z"
      fill={color}
    />
    <path
      d="M21.9945 4.73105C21.6015 4.60611 21.177 4.79769 21.0405 5.16139C20.9055 5.52371 21.1125 5.91796 21.5055 6.04429C22.0995 6.23308 22.5 6.75643 22.5 7.34503L22.5 15.6742C22.5 16.4391 21.8265 17.0624 21 17.0624L20.25 17.0624C19.836 17.0624 19.5 17.3734 19.5 17.7565L19.5 20.4121L15.4875 17.2304C15.3525 17.1207 15.1785 17.0624 15 17.0624L8.35498 17.0624C7.94098 17.0624 7.60498 17.3734 7.60498 17.7565C7.60498 18.1397 7.93948 18.4506 8.35498 18.4506L14.7225 18.4506L19.7625 22.4472C19.9005 22.5583 20.0745 22.6152 20.25 22.6152C20.3565 22.6152 20.463 22.5944 20.5635 22.5514C20.829 22.4389 21 22.1918 21 21.9211L21 18.4506C22.6545 18.4506 24 17.2054 24 15.6742L24 7.34503C24 6.16506 23.1945 5.11419 21.9945 4.73105Z"
      fill={color}
    />
    <path
      d="M14.25 4.5686L5.25 4.5686C4.836 4.5686 4.5 4.87956 4.5 5.2627C4.5 5.64585 4.836 5.9568 5.25 5.9568L14.25 5.9568C14.664 5.9568 15 5.64585 15 5.2627C15 4.87956 14.664 4.5686 14.25 4.5686Z"
      fill={color}
    />
    <path
      d="M11.25 7.34497L5.25 7.34497C4.836 7.34497 4.5 7.65593 4.5 8.03907C4.5 8.42221 4.836 8.73317 5.25 8.73317L11.25 8.73317C11.664 8.73317 12 8.42221 12 8.03907C12 7.65593 11.664 7.34497 11.25 7.34497Z"
      fill={color}
    />
  </svg>
);

export default IconDomain;
