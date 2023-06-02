import React from 'react';

import { SVGProps } from './types';

const IconThumbsUp = ({
  style = {},
  color = 'black',
  size = 36,
  viewBox = '0 0 36 36',
}: SVGProps) => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    style={style}
    xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#1B1B1B" fillOpacity="0.75" />
    <g clipPath="url(#clip0)">
      <path
        d="M27.3135 18.1022C27.7676 17.5679 28.013 16.8757 28.0013 16.1622C27.9934 15.5012 27.7378 14.8696 27.289 14.4022C26.8403 13.9348 26.234 13.6686 25.5994 13.6603H22.1374C22.1658 13.5544 22.1994 13.45 22.2379 13.3476C22.2769 13.2487 22.3229 13.1529 22.3755 13.061C22.4337 12.9571 22.4752 12.879 22.4999 12.8267C22.6498 12.5318 22.7645 12.2888 22.8438 12.0978C22.942 11.8441 23.0212 11.5829 23.0807 11.3165C23.1593 10.9931 23.1992 10.6608 23.1997 10.3272C23.1997 10.1187 23.1975 9.94923 23.1932 9.81883C23.1823 9.62261 23.1615 9.42712 23.1309 9.23317C23.1021 9.01158 23.0516 8.79362 22.9803 8.58269C22.9011 8.37663 22.8004 8.18023 22.68 7.99703C22.5499 7.78726 22.3797 7.60765 22.18 7.46937C21.9478 7.31717 21.695 7.20216 21.43 7.12821C21.0939 7.0328 20.7466 6.98686 20.3983 6.99175C20.2932 6.9906 20.1891 7.01202 20.0923 7.05467C19.9956 7.09733 19.9083 7.1603 19.836 7.23966C19.659 7.42896 19.5153 7.64912 19.4113 7.89014C19.3098 8.10912 19.2283 8.33756 19.1679 8.57246C19.122 8.76351 19.07 9.02886 19.0117 9.3685C18.9389 9.73316 18.8825 9.99586 18.8425 10.1566C18.7861 10.3727 18.7131 10.5838 18.6242 10.7877C18.5338 11.0197 18.4023 11.2319 18.2366 11.4132C17.7897 11.9104 17.3684 12.432 16.9745 12.9757C16.5662 13.5314 16.1455 14.0564 15.7124 14.5507C15.2793 15.045 14.9627 15.3013 14.7626 15.3195C14.5577 15.3353 14.366 15.4307 14.2254 15.5867C14.1532 15.6609 14.096 15.7495 14.0574 15.8472C14.0187 15.9449 13.9994 16.0497 14.0005 16.1553V24.5013C13.9993 24.6097 14.0199 24.7172 14.0609 24.8169C14.1019 24.9165 14.1624 25.0062 14.2385 25.0801C14.3878 25.2366 14.5891 25.3273 14.8008 25.3337C15.4775 25.4455 16.14 25.6363 16.7758 25.9023C17.4177 26.1297 17.92 26.3011 18.2824 26.4163C18.6449 26.5316 19.1511 26.6574 19.8011 26.7939C20.3934 26.9223 20.9964 26.9901 21.6014 26.9963H23.2139C23.6709 27.0266 24.1288 26.9513 24.5546 26.7757C24.9804 26.6002 25.3636 26.3287 25.6769 25.9808C25.9253 25.6508 26.1075 25.2721 26.2127 24.8674C26.318 24.4626 26.344 24.0399 26.2894 23.6245C26.6211 23.2914 26.8551 22.8671 26.9641 22.4009C27.1056 21.904 27.1056 21.375 26.9641 20.8781C27.3413 20.3689 27.5318 19.7363 27.5013 19.0939C27.4911 18.7548 27.4277 18.4199 27.3135 18.1022Z"
        fill="white"
      />
      <path
        d="M12.3999 15.3334H8.80034C8.6953 15.3323 8.59116 15.3537 8.49442 15.3964C8.39768 15.439 8.31042 15.502 8.23809 15.5813C8.16149 15.6571 8.1008 15.7485 8.05984 15.8499C8.01887 15.9513 7.99853 16.0604 8.00008 16.1704V24.5038C7.99898 24.6132 8.01955 24.7217 8.0605 24.8225C8.10145 24.9233 8.1619 25.0141 8.23809 25.0895C8.31071 25.1684 8.39805 25.2309 8.49474 25.2734C8.59143 25.3158 8.69543 25.3372 8.80034 25.3363H12.4032C12.6145 25.3333 12.8164 25.2445 12.9659 25.0889C13.1154 24.9332 13.2006 24.7229 13.2034 24.5027V16.1704C13.2006 15.9502 13.1154 15.7399 12.9659 15.5842C12.8164 15.4285 12.6145 15.3398 12.4032 15.3368L12.3999 15.3334Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="20" height="20" fill="white" transform="translate(8 7)" />
      </clipPath>
    </defs>
  </svg>
);

export default IconThumbsUp;
