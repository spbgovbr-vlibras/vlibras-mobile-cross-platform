import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Player } from 'components';
import { PlayerKeys } from 'constants/player';
import RegionalismArray from 'data/regionalism';
import { MenuLayout } from 'layouts';
import UnityService from 'services/unity';
import { RootState } from 'store';

import { Strings } from './strings';

import './styles.css';

function Home() {
  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );  
  const currentAvatar = useSelector(
    ({ customization }: RootState) => customization.currentavatar
  );
  useEffect(() => {
    UnityService.getService().send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.CHANGE_AVATAR,
      currentAvatar
    );
    UnityService.getService().load(
      RegionalismArray.find(
        (item) => item.name === currentRegionalism.name
      )?.abbreviation ?? ''
    )
  }, []);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <Player />
    </MenuLayout>
  );
}

export default Home;
