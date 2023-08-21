import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

import { Player } from 'components';
import { MenuLayout } from 'layouts';
import UnityService from 'services/unity';
import { RootState } from 'store';

import { Strings } from './strings';

import './styles.css';


function Home() {
  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );
  useEffect(() => {
    UnityService.getService().load(currentRegionalism);
  }, []);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <Player />
    </MenuLayout>
  );
}

export default Home;
