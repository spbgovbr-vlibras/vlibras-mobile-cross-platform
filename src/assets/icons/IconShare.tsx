import React from 'react';

import { SVGProps } from './types';

const IconShare = ({
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
    <path
      d="M18 16.08C17.2735 16.0831 16.5744 16.3578 16.04 16.85L8.91 12.7C8.96514 12.4705 8.99531 12.2359 9 12C8.99531 11.7641 8.96514 11.5295 8.91 11.3L15.96 7.18994C16.5126 7.70905 17.2418 7.99868 18 8C18.7956 8 19.5587 7.68395 20.1213 7.12134C20.6839 6.55873 21 5.79565 21 5C21 4.20435 20.6839 3.44127 20.1213 2.87866C19.5587 2.31605 18.7956 2 18 2C17.2044 2 16.4413 2.31605 15.8787 2.87866C15.3161 3.44127 15 4.20435 15 5C15.0047 5.23589 15.0349 5.47054 15.09 5.69995L8.04001 9.81006C7.48745 9.29095 6.75815 9.00132 6 9C5.20435 9 4.4413 9.31605 3.87869 9.87866C3.31608 10.4413 3 11.2044 3 12C3 12.7956 3.31608 13.5587 3.87869 14.1213C4.4413 14.6839 5.20435 15 6 15C6.75815 14.9987 7.48745 14.7091 8.04001 14.1899L15.16 18.35C15.1082 18.5628 15.0813 18.781 15.08 19C15.0808 19.7742 15.3887 20.5164 15.9361 21.0638C16.4836 21.6113 17.2258 21.9193 18 21.92C18.7742 21.9193 19.5164 21.6113 20.0639 21.0638C20.6113 20.5164 20.9192 19.7742 20.92 19C20.9192 18.2258 20.6113 17.4836 20.0639 16.9362C19.5164 16.3887 18.7742 16.0808 18 16.08Z"
      fill={color}
    />
  </svg>
);

export default IconShare;
