import React from 'react';

import { Strings } from './strings';
import './styles.css';

interface ExploreContainerProps {
  name: string;
}

function ExploreContainer({ name }: ExploreContainerProps) {
  return (
    <div className="container">
      <p>{Strings.TITLE_TEXT}</p>
    </div>
  );
}

export default ExploreContainer;
