/* eslint-disable max-len */
import React from 'react';

import { SVGProps } from './types';

const IconHandsTranslate = ({
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
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.8073 12.3792C12.1694 12.4057 12.5317 12.4323 12.8958 12.4268L13.3078 12.4268C14.1839 12.4257 14.9906 12.2275 15.7053 11.7784C16.1416 11.5044 16.4643 11.1497 16.5532 10.6802C16.7162 9.82008 16.1368 9.12906 15.1311 8.95395C14.9253 8.91807 14.7171 8.89797 14.5086 8.87784C14.1621 8.84439 13.815 8.81088 13.4774 8.70486C13.2461 8.63228 13.0121 8.56563 12.7781 8.49895C12.4097 8.39399 12.041 8.28896 11.6819 8.16065C11.6786 8.15945 11.6752 8.15826 11.6719 8.15708C11.5986 8.13113 11.5324 8.10771 11.5349 8.00591C11.557 7.09448 11.5145 6.18457 11.4456 5.2754C11.3937 4.59071 11.3408 3.90625 11.2878 3.22166C11.2739 3.04175 11.26 2.86183 11.2461 2.6819C11.2352 2.54227 11.2233 2.40264 11.2114 2.263C11.1833 1.93309 11.1551 1.60307 11.1411 1.27268C11.1255 0.912634 11.4313 0.646943 11.8511 0.619015C12.3017 0.5892 12.5328 0.742803 12.6105 1.11983C12.7802 1.94425 12.9698 2.76541 13.1595 3.58659C13.3832 4.55517 13.6069 5.52378 13.7979 6.49781C13.8222 6.62235 13.8721 6.74086 13.9558 6.84578C14.0915 7.01523 14.2772 7.03033 14.4498 6.88653C14.6037 6.7586 14.6675 6.59027 14.6996 6.41591C14.7622 6.07312 14.8224 5.72997 14.8826 5.38683C14.9595 4.94796 15.0365 4.50912 15.1185 4.07111C15.2228 3.51388 15.3304 2.95702 15.4379 2.40017C15.5455 1.84331 15.653 1.28645 15.7574 0.729217C15.8085 0.456355 15.9612 0.254067 16.2227 0.101974C16.4781 -0.0467225 16.7232 -0.0225687 16.9713 0.10839C17.2081 0.233688 17.3711 0.398235 17.3499 0.656756C17.3408 0.769698 17.3277 0.882444 17.3146 0.995135C17.3095 1.03872 17.3044 1.08229 17.2996 1.12587C17.1233 2.73035 17.0028 4.33855 16.8822 5.94682C16.8698 6.11162 16.8575 6.27641 16.8451 6.4412C16.8441 6.45456 16.843 6.46794 16.842 6.48134C16.8304 6.63062 16.8187 6.78174 16.8542 6.93031C16.9118 7.17185 17.0649 7.2145 17.2792 7.04882C17.4045 6.95145 17.4952 6.8303 17.5754 6.70274C18.0177 5.9986 18.4362 5.28368 18.8548 4.5687C19.0913 4.1647 19.3278 3.76068 19.5686 3.35858C19.6072 3.29436 19.6456 3.23013 19.6841 3.1659C19.9025 2.80131 20.1208 2.43683 20.3476 2.07617C20.5063 1.82331 20.7357 1.6999 20.9747 1.76028C21.4674 1.88445 21.7163 1.99653 21.5784 2.55433C21.4995 2.87329 21.3411 3.16738 21.1831 3.46077C21.136 3.5482 21.089 3.63558 21.0441 3.72353C20.8755 4.0535 20.705 4.38279 20.5345 4.71209C20.0741 5.60155 19.6136 6.4911 19.1892 7.39452C19.1862 7.40086 19.1832 7.4072 19.1802 7.41354C19.0686 7.65072 18.956 7.88987 18.9463 8.15121C18.9368 8.41652 19.0955 8.51918 19.3865 8.44936C19.6398 8.3886 19.8397 8.25915 20.0049 8.08668C20.3088 7.76957 20.6121 7.45201 20.9154 7.13444C21.2904 6.74183 21.6654 6.3492 22.0416 5.95737L22.0556 5.94274C22.3289 5.65814 22.6024 5.37334 22.8873 5.09803C23.2516 4.74629 23.8058 4.83837 23.9758 5.26786C24.0426 5.43664 23.9587 5.57173 23.8744 5.70771C23.8699 5.71494 23.8654 5.72218 23.8609 5.72942C23.2 6.79936 22.4219 7.804 21.6192 8.79581C21.1078 9.42759 20.6139 10.0707 20.2994 10.801C20.1468 11.1555 20.0834 11.5265 20.02 11.8975C19.989 12.079 19.9579 12.2605 19.9165 12.44C19.6944 13.4016 19.4299 14.3519 18.9931 15.2585C18.6778 15.9125 18.2021 16.4537 17.4557 16.7839C17.264 16.8684 17.071 16.9171 16.8524 16.8824C16.237 16.785 15.616 16.7888 14.9958 16.8235C14.844 16.8322 14.7599 16.8005 14.6731 16.699C14.3419 16.3103 14.0081 15.9232 13.6744 15.5362C13.4405 15.2649 13.2065 14.9936 12.9735 14.7218C12.381 14.0308 11.832 13.3171 11.4378 12.5204C11.3753 12.394 11.364 12.3479 11.5557 12.3611C11.6396 12.3669 11.7234 12.373 11.8073 12.3792ZM0.415486 12.8567C0.212952 12.2672 0.0108537 11.6769 1.04835e-05 10.9878C0.00243663 10.9664 0.00444317 10.9405 0.00669765 10.9115C0.0133104 10.8264 0.0220709 10.7136 0.0498839 10.6036C0.184762 10.0212 0.347833 9.45174 1.1081 9.23361C1.12679 9.22836 1.14444 9.21983 1.16205 9.21131C1.16977 9.20758 1.17749 9.20385 1.18529 9.20039C2.06569 8.81016 2.80731 8.26444 3.4765 7.63984C3.67599 7.45378 3.91192 7.32848 4.19729 7.28281C4.82875 7.18205 5.47105 7.15563 6.08776 7.30697C7.43958 7.6387 8.70814 8.15876 9.95153 8.71732C11.4335 9.38306 12.9562 9.92652 14.6346 10.0696C14.6447 10.0704 14.6549 10.0712 14.6651 10.0721C14.7124 10.0759 14.7599 10.0797 14.8063 10.0884L14.8088 10.0889C14.9793 10.1208 15.1553 10.1538 15.2192 10.3217C15.2829 10.4896 15.1749 10.6138 15.0496 10.7228C14.7538 10.9802 14.3791 11.1112 13.9818 11.1901C13.5427 11.2771 13.0973 11.2618 12.6523 11.2465C12.5704 11.2437 12.4885 11.2409 12.4067 11.2387C12.1886 11.233 11.9716 11.215 11.7547 11.197C11.4615 11.1727 11.1685 11.1484 10.8731 11.1542C10.2634 11.1659 9.92595 11.3844 9.85699 11.8139C9.83184 11.972 9.86566 12.1283 9.91424 12.2789C10.1575 13.0291 10.5596 13.7179 11.0509 14.3629C11.9827 15.5865 13.0137 16.7469 14.0447 17.9073C14.2061 18.089 14.3676 18.2708 14.5287 18.4528C14.6378 18.576 14.7479 18.6985 14.8581 18.8211C15.0862 19.0747 15.3143 19.3285 15.5327 19.588C15.7929 19.8975 15.7058 20.2515 15.3315 20.5145C15.0184 20.7346 14.7209 20.6995 14.4017 20.41C14.1766 20.2058 13.9484 20.0043 13.7186 19.8047C13.6144 19.7141 13.5102 19.6236 13.4059 19.533C12.299 18.5716 11.192 17.61 10.1103 16.6269C9.99577 16.5228 9.87997 16.4178 9.73425 16.345C9.43717 16.1971 9.20298 16.3129 9.18953 16.6133C9.18129 16.796 9.25979 16.9587 9.3461 17.1175C10.2751 18.8325 11.1789 20.5576 12.0541 22.294C12.1556 22.4948 12.1746 22.6903 12.1044 22.8986C12.0068 23.1896 11.8108 23.342 11.482 23.3722C11.1225 23.4051 10.8749 23.2926 10.7127 23.0258C9.66746 21.3037 8.55287 19.6156 7.42137 17.9358C7.33723 17.8108 7.25136 17.6859 7.12125 17.5923C6.97683 17.4885 6.84933 17.5149 6.77907 17.6655C6.71575 17.8014 6.69927 17.9459 6.71662 18.0916C6.74005 18.2874 6.76329 18.4832 6.78653 18.6789C6.86265 19.3202 6.93877 19.9614 7.0215 20.6021C7.05245 20.8418 7.08476 21.0814 7.11707 21.321C7.20837 21.998 7.29967 22.675 7.36022 23.3549C7.39058 23.6953 7.22621 23.8995 6.89833 23.9678C6.46681 24.0576 6.24042 23.9644 6.06651 23.6217C6.02878 23.5474 5.99365 23.4704 5.97196 23.3919C5.82783 22.8747 5.73186 22.3501 5.63588 21.8255C5.59583 21.6066 5.55579 21.3877 5.51225 21.1693C5.46536 20.9343 5.4198 20.6991 5.37423 20.4639C5.22086 19.6721 5.06751 18.8804 4.86388 18.0965C4.81791 17.9188 4.75589 17.7437 4.63576 17.5912C4.4935 17.4108 4.30398 17.3983 4.12877 17.5565C3.99606 17.6761 3.90672 17.8195 3.86248 17.9814C3.81213 18.1653 3.79126 18.3528 3.7704 18.5402C3.76485 18.5901 3.7593 18.64 3.75319 18.6898C3.64303 19.5892 3.53287 20.4885 3.41968 21.3875C3.38976 21.6249 3.35679 21.8619 3.31212 22.0974C3.25574 22.394 3.02285 22.5703 2.71059 22.5684C2.37795 22.5661 2.16154 22.394 2.12033 22.08C2.02709 21.3682 2.00584 20.6527 1.98936 19.9371C1.9801 19.5425 1.99458 19.1479 2.00905 18.7533C2.03119 18.1499 2.05332 17.5465 1.99066 16.9428C1.93645 16.4205 1.83887 15.911 1.58125 15.4302C1.13238 14.5931 0.719939 13.7428 0.415486 12.8567Z"
      fill={color}
    />
  </svg>
);

export default IconHandsTranslate;
