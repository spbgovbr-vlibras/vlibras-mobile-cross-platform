/* eslint-disable max-len */
import React from 'react';

import { SVGProps } from './types';

const IconDictionary = ({
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
    xmlns="http://www.w3.org/2000/svg">
    <g clipPath="url(#clip0)">
      <path
        d="M21.1758 0.703125C21.1758 0.314812 20.861 0 20.4727 0H4.93945C3.77311 0 2.82422 0.948891 2.82422 2.11523V21.8848C2.82422 23.0511 3.77311 24 4.93945 24H20.4727C20.861 24 21.1758 23.6852 21.1758 23.2969V0.703125ZM19.7695 19.7695H7.05469V1.40625H19.7695V19.7695ZM4.93945 1.40625H5.64844V19.7695H4.93945C4.69083 19.7695 4.45223 19.813 4.23047 19.8922V2.11523C4.23047 1.7243 4.54852 1.40625 4.93945 1.40625ZM19.7695 22.5938H4.93945C4.54852 22.5938 4.23047 22.2757 4.23047 21.8848C4.23047 21.4938 4.54852 21.1758 4.93945 21.1758H19.7695V22.5938Z"
        fill={color}
      />
      <path
        d="M12.2891 12.3516L12.0156 11.6328L9.6875 11.6328L9.41406 12.3672C9.30729 12.6536 9.21615 12.8477 9.14063 12.9492C9.0651 13.0482 8.94141 13.0977 8.76953 13.0977C8.6237 13.0977 8.49479 13.0443 8.38281 12.9375C8.27083 12.8307 8.21484 12.7096 8.21484 12.5742C8.21484 12.4961 8.22787 12.4154 8.25391 12.332C8.27995 12.2487 8.32292 12.1328 8.38281 11.9844L9.84766 8.26562C9.88932 8.15885 9.9388 8.03125 9.99609 7.88281C10.056 7.73177 10.1185 7.60677 10.1836 7.50781C10.2513 7.40885 10.3385 7.32943 10.4453 7.26953C10.5547 7.20703 10.6888 7.17578 10.8477 7.17578C11.0091 7.17578 11.1432 7.20703 11.25 7.26953C11.3594 7.32943 11.4466 7.40755 11.5117 7.50391C11.5794 7.60026 11.6354 7.70443 11.6797 7.81641C11.7266 7.92578 11.7852 8.07292 11.8555 8.25781L13.3516 11.9531C13.4688 12.2344 13.5273 12.4388 13.5273 12.5664C13.5273 12.6992 13.4714 12.8216 13.3594 12.9336C13.25 13.043 13.1172 13.0977 12.9609 13.0977C12.8698 13.0977 12.7917 13.0807 12.7266 13.0469C12.6615 13.0156 12.6068 12.9727 12.5625 12.918C12.5182 12.8607 12.4701 12.7747 12.418 12.6602C12.3685 12.543 12.3255 12.4401 12.2891 12.3516ZM9.99219 10.7617L11.7031 10.7617L10.8398 8.39844L9.99219 10.7617ZM16.647 9.98437L14.6939 12.168L16.7838 12.168C16.953 12.168 17.0806 12.2083 17.1666 12.2891C17.2525 12.3672 17.2955 12.4687 17.2955 12.5937C17.2955 12.7135 17.2525 12.8112 17.1666 12.8867C17.0832 12.9622 16.9556 13 16.7838 13L13.8931 13C13.69 13 13.5377 12.9557 13.4361 12.8672C13.3371 12.7786 13.2877 12.6576 13.2877 12.5039C13.2877 12.4128 13.3228 12.3216 13.3931 12.2305C13.4634 12.1367 13.6093 11.9661 13.8306 11.7187C14.065 11.4583 14.2772 11.2227 14.4673 11.0117C14.6601 10.8008 14.8384 10.6042 15.0025 10.4219C15.1666 10.237 15.302 10.0807 15.4088 9.95312C15.5181 9.82552 15.6054 9.71615 15.6705 9.625L14.0845 9.625C13.8658 9.625 13.7004 9.60547 13.5884 9.56641C13.4765 9.52734 13.4205 9.42448 13.4205 9.25781C13.4205 9.13542 13.4621 9.03776 13.5455 8.96484C13.6314 8.89193 13.7525 8.85547 13.9088 8.85547L16.358 8.85547C16.5845 8.85547 16.7577 8.88932 16.8775 8.95703C16.9999 9.02213 17.0611 9.14062 17.0611 9.3125C17.0611 9.36979 17.0494 9.42969 17.0259 9.49219C17.0025 9.55208 16.9765 9.60156 16.9478 9.64062C16.9192 9.67969 16.8801 9.72786 16.8306 9.78516C16.7811 9.83984 16.7199 9.90625 16.647 9.98437Z"
        fill={color}
      />
    </g>
    <defs>
      <clipPath id="clip0">
        <rect width="24" height="24" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default IconDictionary;
