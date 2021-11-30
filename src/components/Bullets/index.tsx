import React from 'react';
import './styles.css';

interface BulletsProps {
  active: number;
}

const Bullets = ({ active }: BulletsProps) => {
  const loadBullets = () => {
    return [1, 2, 3, 4].map(item => (
      <div className={`bullet${item <= active ? ' active' : ''}`} key={item} />
    ));
  };

  return <div className="bullet-container">{loadBullets()}</div>;
};

export default Bullets;
