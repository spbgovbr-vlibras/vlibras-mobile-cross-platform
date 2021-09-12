import React from 'react';

import { SVGProps } from './types';

const IconCustomization = ({
  style = {},
  color = 'black',
  size = 24,
  viewBox = '0 0 24 24',
}: SVGProps) => (
  <svg
    width="16"
    height="24"
    viewBox="0 0 16 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.088 2.81529C3.66483 2.99722 3.24504 3.18252 2.81039 3.37439C2.60092 3.46685 2.38799 3.56084 2.16956 3.65672C2.00436 3.72923 1.8129 3.70712 1.66857 3.59885C1.66768 3.59819 1.6668 3.59752 1.66591 3.59684C1.5646 3.80818 1.42192 3.9975 1.24555 4.1527C1.23356 4.16325 1.22108 4.17322 1.20814 4.18257C1.04322 4.30178 0.931588 4.38805 0.859149 4.47605C0.799983 4.54793 0.794538 4.58688 0.799011 4.62678L0.799028 4.62694C0.818366 4.79994 0.809461 4.97102 0.796609 5.11408C0.832779 5.1452 0.864751 5.18173 0.891217 5.22295C0.894451 5.22799 0.900831 5.23738 0.90931 5.24986C0.941693 5.29752 1.0047 5.39026 1.04015 5.45788L1.04359 5.46445L1.04354 5.46448C1.38825 6.14648 1.82611 6.77448 2.34374 7.32965C3.69434 8.73697 4.70507 10.3631 5.48767 12.13C5.61455 12.3907 5.65507 12.6857 5.60375 12.9712L5.60245 12.9785L5.60239 12.9785C5.45482 13.735 5.17724 14.4507 4.91844 15.1181C4.86515 15.2555 4.81265 15.3909 4.76225 15.5241L4.76215 15.5244C4.6973 15.6955 4.56601 15.8905 4.31487 15.9659C4.13994 16.0184 3.96717 15.9847 3.90877 15.9733C3.90479 15.9725 3.90134 15.9718 3.89845 15.9713L3.98977 15.4797M4.088 2.81529L9.4026 0.780781C9.84597 0.803454 10.2962 0.81566 10.7393 0.827671C10.7773 0.828703 10.8154 0.829735 10.8534 0.830771C10.8637 0.977005 10.9281 1.10312 11.0133 1.19637C11.1064 1.29818 11.2197 1.35802 11.3092 1.39533L11.3096 1.39552C11.5093 1.47852 11.7075 1.56828 11.9141 1.66184L11.9537 1.67975C12.1719 1.77851 12.3993 1.88092 12.6316 1.97506C13.0969 2.1636 13.6034 2.32816 14.1612 2.38061L14.1614 2.38062C14.3975 2.40275 14.6547 2.38977 14.897 2.26087C15.1408 2.13119 15.297 1.92291 15.4114 1.70448L15.4114 1.70447C15.4335 1.66215 15.4536 1.61977 15.4718 1.5775L15.4738 1.5847C15.5069 1.70393 15.5087 1.8302 15.4789 1.95043C15.4491 2.07062 15.3891 2.1795 15.3061 2.26652C15.3007 2.27216 15.2954 2.27793 15.2903 2.28382C15.051 2.55952 14.732 2.74667 14.3823 2.81937L14.3823 2.81935L14.3787 2.82013C13.5635 2.99584 12.771 3.26699 12.017 3.62812C12.0136 3.62927 12.0087 3.63093 12.002 3.63317L11.9991 3.63413C11.9763 3.6417 11.9158 3.66179 11.8533 3.69636C11.781 3.73638 11.6915 3.80293 11.622 3.91223C11.5524 4.02175 11.5253 4.13908 11.5212 4.24589C11.5161 4.38014 11.5648 4.50552 11.6493 4.59943C11.6084 4.85768 11.6651 5.10885 11.7174 5.29455C11.719 5.30032 11.7207 5.30605 11.7225 5.31176C11.8362 5.66652 11.8312 6.05011 11.7085 6.40157C11.4674 7.08919 11.5835 7.84805 11.8824 8.4723C12.1811 9.0963 12.6962 9.65707 13.3502 9.91667L13.3645 9.92208C13.5352 9.9839 13.6999 10.0622 13.8562 10.156C13.5777 10.5638 13.203 10.8922 12.7674 11.1106C12.5354 11.2247 12.2483 11.3715 12.0903 11.6556C11.9689 11.8738 11.9551 12.1168 11.966 12.3387C11.9592 12.3404 11.9522 12.3422 11.9451 12.3442C11.8828 12.3617 11.7976 12.3956 11.7159 12.4651C11.6304 12.5377 11.5717 12.6296 11.5384 12.7279L11.538 12.7291C11.5051 12.827 11.4881 12.9575 11.5337 13.0975C11.5545 13.1612 11.5841 13.2141 11.6159 13.2572C11.1144 14.0125 10.9862 14.876 10.8756 15.6203C10.8691 15.6644 10.8626 15.7081 10.8561 15.7513C10.8356 15.8876 10.8159 15.9701 10.7989 16.0199C10.7374 16.0232 10.6424 16.018 10.4882 15.999L10.4882 15.999L10.4839 15.9985C9.7646 15.9161 9.05154 15.7842 8.34955 15.6037C8.1368 15.5335 7.90598 15.5419 7.69848 15.6279C7.48867 15.7149 7.31901 15.8742 7.21733 16.0744C7.00636 16.4454 6.81987 16.8303 6.65908 17.2265C6.58592 17.3781 6.56339 17.5494 6.59457 17.7147C6.62662 17.8846 6.71398 18.0404 6.84468 18.1561C6.86196 18.1734 6.8765 18.1942 6.88715 18.2179C6.89802 18.242 6.9045 18.2684 6.90602 18.2956C6.90613 18.4071 6.90827 18.5349 6.92407 18.6711C6.92017 18.6743 6.91631 18.6776 6.9125 18.6809L6.90723 18.6852L6.89405 18.6959L6.89332 18.6965C6.88639 18.7023 6.85895 18.7251 6.8311 18.7562C6.81797 18.7709 6.78338 18.8106 6.75382 18.8697C6.73003 18.9173 6.65772 19.0807 6.73506 19.2783C6.73978 19.2903 6.74496 19.3022 6.7506 19.3138C6.77755 19.3695 6.81023 19.4223 6.84818 19.4713C6.88288 19.5161 6.92456 19.5542 6.97119 19.5844C6.99118 19.6094 7.01355 19.6324 7.03804 19.6531C7.4912 20.0371 7.71688 20.5588 7.86797 21.2428L7.86799 21.243C8.01978 21.9293 8.20946 22.6148 8.39499 23.2853C8.41418 23.3547 8.43332 23.4238 8.45238 23.4929L0.612149 23.4996C0.821654 22.8061 1.18905 22.1705 1.63368 21.5259C2.44629 20.3482 3.01686 19.0523 3.54113 17.7813L3.54116 17.7812C3.5987 17.6417 3.666 17.4173 3.58115 17.1751C3.52433 17.0129 3.42033 16.9003 3.31167 16.8214C3.4617 16.5248 3.6263 16.236 3.80483 15.9564C3.82937 15.9593 3.85928 15.9641 3.90005 15.9716L3.98977 15.4797M4.088 2.81529C5.18417 2.35723 6.25026 1.82753 7.27964 1.22948L7.27965 1.2295L7.28398 1.22693C7.91336 0.852739 8.61864 0.740789 9.40254 0.780778L4.088 2.81529ZM3.98977 15.4797C3.77671 15.4408 3.55297 15.4117 3.41046 15.6451L1.98056 7.67332C3.28683 9.03377 4.26953 10.6122 5.03454 12.3415C5.11765 12.5084 5.14474 12.6986 5.11164 12.8827C4.97339 13.5914 4.71531 14.2577 4.45709 14.9244C4.40256 15.0652 4.34801 15.206 4.29459 15.3472C4.23021 15.5171 4.13113 15.506 3.98977 15.4797ZM13.9399 10.0249C13.9399 10.0249 13.9397 10.0256 13.939 10.0269C13.9395 10.0256 13.9399 10.0249 13.9399 10.0249ZM12.2998 12.5554C12.2997 12.5553 12.301 12.5559 12.3033 12.5572C12.301 12.556 12.2999 12.5554 12.2998 12.5554ZM12.1731 13.3157L12.1735 13.3156L12.1731 13.3157ZM6.93507 18.7759L6.93992 18.7821C6.94455 18.8092 6.94981 18.8365 6.95578 18.864C6.94655 18.8744 6.93831 18.8844 6.93102 18.8938C6.93073 18.8941 6.93044 18.8945 6.93015 18.8949L6.97044 18.9261C6.98984 19.002 7.01506 19.079 7.04782 19.1558C7.04948 19.1597 7.05116 19.1636 7.05287 19.1675C7.05403 19.1702 7.05521 19.1729 7.0564 19.1756L6.89935 19.276L6.83373 19.3005L6.93507 18.7759ZM6.84765 19.309L6.83692 19.3159C6.84524 19.3533 6.85576 19.3814 6.86158 19.3961C6.86863 19.4139 6.87623 19.4302 6.88324 19.4441C6.89393 19.4653 6.90324 19.4808 6.90709 19.4872L6.90746 19.4878L6.84765 19.309ZM7.56166 19.5523C7.56758 19.5481 7.58722 19.5339 7.61023 19.5134C7.62712 19.5323 7.64367 19.5513 7.65987 19.5705C7.62439 19.6005 7.57568 19.6322 7.51183 19.6539C7.46416 19.6701 7.41785 19.6774 7.37433 19.6786C7.329 19.6798 7.2867 19.6743 7.24907 19.665C7.29264 19.6646 7.33577 19.6584 7.3774 19.6468C7.43654 19.6304 7.49265 19.603 7.54266 19.5657L7.54682 19.5628L7.56097 19.5528L7.56166 19.5523ZM7.30406 19.1244L7.30072 19.1207L7.42575 19.0238L7.42718 19.0227L7.43835 19.0141L7.43646 19.0338L7.43623 19.0362L7.43275 19.0723L7.43227 19.0773L7.42024 19.2021L7.41249 19.2113C7.3944 19.1927 7.37514 19.1748 7.35424 19.1795L7.30454 19.1249L7.30406 19.1244ZM7.17719 19.0983C7.17828 19.0954 7.17948 19.0922 7.18078 19.0889L7.17719 19.0983ZM11.7916 13.0169L11.7916 13.017L11.7916 13.0169Z"
      stroke="#4B4B4B"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IconCustomization;