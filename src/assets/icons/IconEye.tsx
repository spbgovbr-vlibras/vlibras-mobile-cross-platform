import React from 'react';

import { SVGProps } from './types';

const IconEye = ({
  style = {},
  color = 'gray',
  size = 24,
  viewBox = '0 0 25 18',
}: SVGProps) => (
  <svg
    width="25"
    height="18"
    viewBox="viewBox"
    fill="none"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M24.4546 8.40199C22.195 3.96241 17.7217 0.958632 12.5996 0.958632C7.4775 0.958632 3.00292 3.96451 0.744587 8.40241C0.649271 8.59227 0.599609 8.80204 0.599609 9.01478C0.599609 9.22753 0.649271 9.4373 0.744587 9.62716C3.00417 14.0667 7.4775 17.0705 12.5996 17.0705C17.7217 17.0705 22.1963 14.0646 24.4546 9.62674C24.5499 9.43688 24.5996 9.22711 24.5996 9.01437C24.5996 8.80162 24.5499 8.59185 24.4546 8.40199ZM12.5996 15.0565C11.4129 15.0565 10.2529 14.7022 9.26616 14.0383C8.27947 13.3744 7.51044 12.4308 7.05631 11.3267C6.60218 10.2227 6.48336 9.00787 6.71488 7.83585C6.94639 6.66382 7.51783 5.58725 8.35695 4.74227C9.19606 3.89728 10.2652 3.32184 11.429 3.08871C12.5929 2.85558 13.7993 2.97523 14.8957 3.43253C15.992 3.88984 16.9291 4.66425 17.5884 5.65784C18.2477 6.65144 18.5996 7.81959 18.5996 9.01458C18.6 9.80812 18.445 10.594 18.1436 11.3272C17.8423 12.0604 17.4003 12.7266 16.8431 13.2877C16.2859 13.8489 15.6243 14.2939 14.8961 14.5974C14.168 14.9009 13.3876 15.0569 12.5996 15.0565ZM12.5996 4.9866C12.2426 4.99163 11.8878 5.04512 11.545 5.14562C11.8276 5.53234 11.9632 6.00823 11.9272 6.487C11.8913 6.96576 11.6861 7.4157 11.349 7.7552C11.0118 8.09471 10.565 8.3013 10.0896 8.33752C9.61412 8.37374 9.14153 8.23718 8.7575 7.95262C8.53882 8.76391 8.5783 9.62384 8.87037 10.4114C9.16244 11.1989 9.69241 11.8743 10.3857 12.3427C11.0789 12.811 11.9006 13.0486 12.735 13.0221C13.5694 12.9955 14.3745 12.7062 15.037 12.1947C15.6996 11.6832 16.1861 10.9754 16.4283 10.1709C16.6704 9.36642 16.6559 8.5057 16.3868 7.70992C16.1177 6.91414 15.6076 6.22337 14.9282 5.73485C14.2488 5.24632 13.4344 4.98462 12.5996 4.9866Z"
      fill={color}
    />
  </svg>

  /*   <svg
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
        d="M18.2071 3.20709C18.4174 2.9968 18.7026 2.87866 19 2.87866C19.2974 2.87866 19.5826 2.9968 19.7929 3.20709C20.0032 3.41738 20.1213 3.70259 20.1213 3.99998C20.1213 4.29737 20.0032 4.58259 19.7929 4.79288L10.4888 14.097L8.37437 14.6256L8.90296 12.5112L18.2071 3.20709ZM19 0.878662C18.1722 0.878662 17.3783 1.20751 16.7929 1.79288L7.29289 11.2929C7.16473 11.421 7.07382 11.5816 7.02986 11.7574L6.02986 15.7574C5.94466 16.0982 6.04451 16.4587 6.29289 16.7071C6.54127 16.9555 6.90176 17.0553 7.24254 16.9701L11.2425 15.9701C11.4184 15.9262 11.5789 15.8352 11.7071 15.7071L21.2071 6.20709C21.7925 5.62173 22.1213 4.82781 22.1213 3.99998C22.1213 3.17216 21.7925 2.37824 21.2071 1.79288C20.6217 1.20751 19.8278 0.878662 19 0.878662ZM3 3C2.20435 3 1.44129 3.31607 0.87868 3.87868C0.31607 4.44129 0 5.20435 0 6V20C0 20.7956 0.31607 21.5587 0.87868 22.1213C1.44129 22.6839 2.20435 23 3 23H17C17.7956 23 18.5587 22.6839 19.1213 22.1213C19.6839 21.5587 20 20.7956 20 20V13C20 12.4477 19.5523 12 19 12C18.4477 12 18 12.4477 18 13V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H3C2.73478 21 2.48043 20.8946 2.29289 20.7071C2.10536 20.5196 2 20.2652 2 20V6C2 5.73478 2.10536 5.48043 2.29289 5.29289C2.48043 5.10536 2.73478 5 3 5H10C10.5523 5 11 4.55228 11 4C11 3.44772 10.5523 3 10 3H3Z"
        fill={color}
      />
    </svg> */
);

export default IconEye;
