import React from 'react';

import { SVGProps } from './types';

const IconIcaro = ({
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
      d="M6.30273 2.2667C6.23667 2.57432 6.01731 2.82627 5.96861 3.19888C6.63684 2.90557 7.2628 2.62579 7.89288 2.35493C8.96975 1.90506 10.0171 1.38471 11.0285 0.797145C11.7689 0.356922 12.5815 0.238235 13.4281 0.28143C14.1058 0.316091 14.7849 0.325544 15.4631 0.348783C15.5919 0.33046 15.7231 0.356467 15.8358 0.422701C15.7465 0.53535 15.6045 0.537056 15.4981 0.607954C15.331 0.720078 15.276 0.839816 15.5015 0.933821C16.3859 1.30144 17.2292 1.79077 18.208 1.8828C18.5848 1.91812 18.7889 1.81532 18.9684 1.47251C19.1578 1.1108 19.1564 0.708787 19.2175 0.319636C19.2373 0.193333 19.2135 0.012281 19.3758 0.00046467C19.5234 -0.01017 19.5614 0.164056 19.6035 0.285239C19.737 0.668525 19.8543 1.05711 19.9556 1.45098C20.0117 1.65321 20.0147 1.86698 19.9642 2.07074C19.9137 2.2745 19.8115 2.46106 19.6679 2.61161C19.3577 2.96895 18.9422 3.21366 18.4841 3.3089C17.7038 3.47707 16.9453 3.73701 16.2236 4.08352C16.1465 4.12173 16.0264 4.1191 16.0208 4.26484C16.1915 4.29845 16.3305 4.09416 16.504 4.19525C16.5024 4.22151 16.5076 4.25788 16.499 4.26182C16.0794 4.45075 16.0908 4.7753 16.1987 5.1592C16.3455 5.61749 16.3391 6.11264 16.1805 6.56679C15.8066 7.63196 16.5106 9.04546 17.5347 9.45194C17.7886 9.54388 18.0309 9.66674 18.2561 9.81785C18.453 9.9582 18.4812 10.1115 18.3461 10.3202C18.0137 10.8523 17.5444 11.2807 16.9897 11.5585C16.4894 11.8044 16.4274 11.9114 16.4778 12.483C16.4993 12.726 16.3715 12.7928 16.1771 12.8137C16.1141 12.8204 16.0373 12.8137 16.012 12.8884C15.9823 12.9767 16.069 12.9934 16.1179 13.0252C16.2411 13.107 16.2746 13.2141 16.1813 13.3302C15.5975 14.0566 15.4836 14.9413 15.3506 15.8257C15.2504 16.4913 15.0881 16.5768 14.427 16.4952C13.6782 16.4094 12.936 16.2717 12.2056 16.083C12.1031 16.0456 11.9907 16.048 11.8899 16.0898C11.7891 16.1316 11.7068 16.2098 11.6588 16.3096C11.4526 16.6709 11.2709 17.0462 11.1149 17.4329C11.084 17.4906 11.0737 17.5574 11.0859 17.622C11.0981 17.6866 11.1319 17.7447 11.1816 17.7865C11.2497 17.8502 11.3046 17.9271 11.3432 18.0128C11.3817 18.0985 11.4031 18.1912 11.406 18.2854C11.406 18.5983 11.4271 18.9017 11.6255 19.1626C11.6468 19.1905 11.658 19.2643 11.642 19.2779C11.5472 19.3585 11.4978 19.2253 11.4187 19.2177C11.391 19.189 11.3605 19.1558 11.3256 19.2009C11.3189 19.2094 11.3484 19.2474 11.3613 19.2717C11.9353 19.7581 12.1949 20.4049 12.3562 21.135C12.5687 22.096 12.853 23.0407 13.1066 23.9923L4.26062 23.9999C4.16346 23.9999 4.06413 24.0063 4 23.908C4.18068 22.9102 4.65886 22.0585 5.22211 21.242C6.00202 20.1117 6.55576 18.8589 7.07891 17.5906C7.16244 17.388 7.128 17.2653 6.92393 17.1727C6.72963 17.0845 6.71009 16.9233 6.79825 16.7312C6.98078 16.3569 7.18522 15.9943 7.41046 15.6451C7.55297 15.4117 7.77671 15.4408 7.98977 15.4797C8.13113 15.506 8.23021 15.5171 8.29459 15.3472C8.60095 14.5373 8.9442 13.7411 9.11164 12.8827C9.14474 12.6986 9.11765 12.5084 9.03454 12.3415C8.26953 10.6122 7.28683 9.03377 5.98056 7.67332C5.42949 7.0828 4.96371 6.41497 4.5973 5.69002C4.56441 5.62726 4.5202 5.57054 4.47047 5.49308C4.34993 5.68805 4.45312 5.85545 4.4688 6.05238C4.42325 6.03124 4.38365 5.99871 4.35366 5.95779C4.32368 5.91688 4.30427 5.8689 4.29724 5.81829C4.20111 5.44266 4.34543 5.06992 4.30212 4.68248C4.25522 4.26405 4.60065 4.00475 4.91523 3.77735C5.06256 3.6477 5.17746 3.484 5.25038 3.29984C5.47562 2.84564 5.8341 2.47467 6.27574 2.23874C6.28448 2.24727 6.2936 2.25725 6.30273 2.2667ZM11.2424 19.0566C11.2248 19.0726 11.1983 19.0901 11.2007 19.096C11.2125 19.1205 11.2269 19.1436 11.2435 19.1651C11.2572 19.1542 11.2841 19.1388 11.282 19.1333C11.2712 19.1065 11.2579 19.0809 11.2424 19.0566Z"
      fill={color}
    />
  </svg>
);

export default IconIcaro;
