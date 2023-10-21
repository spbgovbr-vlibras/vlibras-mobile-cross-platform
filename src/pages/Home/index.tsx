import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Player } from 'components';
import RegionalismArray from 'data/regionalism';
import { MenuLayout } from 'layouts';
import UnityService from 'services/unity';
import { RootState } from 'store';
import { Creators } from 'store/ducks/customization';

import { Strings } from './strings';

import './styles.css';


function Home() {
  const currentRegionalism = useSelector(
    ({ regionalism }: RootState) => regionalism.current
  );
  useEffect(() => {
    UnityService.getService().load(
      RegionalismArray.find(
        (item) => item.name === currentRegionalism.name
      )?.abbreviation ?? ''
    );
  }, []);

  return (
    <MenuLayout title={Strings.TOOLBAR_TITLE}>
      <Player />
    </MenuLayout>
  );
}

export default Home;
