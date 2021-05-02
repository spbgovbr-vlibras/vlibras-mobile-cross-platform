import React, { useState } from 'react';
import './styles.css';
interface BulletsProps {
  active: number;
}

const Bullets: React.FunctionComponent<BulletsProps> = ({ active }) => {
  const loadBullets = () => {
    return [1, 2, 3, 4].map(item => {
      return item <= active ? (
        <div className={`bullet active`} key={item}></div>
      ) : (
        <div className={`bullet`} key={item}></div>
      );
    });
  };

  return <div className="bullet-container">{loadBullets()}</div>;
};

export default Bullets;
