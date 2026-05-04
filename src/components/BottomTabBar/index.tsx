import React from 'react';
import { useHistory } from 'react-router';

import { IconDictionary, IconHandsTranslate, IconHistory } from 'assets';
import paths from 'constants/paths';

import './styles.css';

export type BottomTabId = 'dictionary' | 'translator' | 'history';

interface BottomTabBarProps {
  active: BottomTabId;
  /**
   * Optional click override. When provided, replaces the default navigation
   * behaviour for that tab.
   */
  onTabClick?: (tab: BottomTabId) => boolean | void;
  /**
   * Optional render-prop to inject extra elements (e.g. tutorial popovers)
   * inside each tab cell. The element is rendered as a sibling of the button
   * so it can position itself absolutely relative to the cell.
   */
  renderTabExtras?: (tab: BottomTabId) => React.ReactNode;
}

interface TabConfig {
  id: BottomTabId;
  label: string;
  path: string;
  Icon: React.FC<{ color?: string; size?: number; viewBox?: string }>;
  /**
   * viewBox specifically chosen so the rendered icon has the same visual
   * weight across tabs (some assets bundle text/extra geometry that we crop
   * out with this viewBox).
   */
  viewBox: string;
}

const ICON_SIZE = 24;

const TABS: TabConfig[] = [
  {
    id: 'dictionary',
    label: 'Dicionário',
    path: paths.DICTIONARY_PLAYER,
    Icon: IconDictionary,
    /* Crop the IconDictionary asset so only the book is visible (the asset
       also contains the word "DICIONÁRIO" in its lower half). */
    viewBox: '28 6 24 21',
  },
  {
    id: 'translator',
    label: 'Tradutor',
    path: paths.HOME,
    Icon: IconHandsTranslate,
    viewBox: '0 0 24 24',
  },
  {
    id: 'history',
    label: 'Histórico',
    path: paths.HISTORY,
    Icon: IconHistory,
    viewBox: '25 5 25 22',
  },
];

const BottomTabBar: React.FC<BottomTabBarProps> = ({
  active,
  onTabClick,
  renderTabExtras,
}) => {
  const history = useHistory();

  const handleClick = (tab: TabConfig) => {
    if (tab.id === active) return;
    if (onTabClick) {
      const handled = onTabClick(tab.id);
      if (handled) return;
    }
    history.push(tab.path);
  };

  return (
    <div className="bottom-tab-bar">
      {TABS.map((tab) => {
        const isActive = tab.id === active;
        const { Icon } = tab;
        return (
          <div className="bottom-tab-cell" key={tab.id}>
            {renderTabExtras?.(tab.id)}
            <button
              type="button"
              className={`bottom-tab-button ${isActive ? 'is-active' : ''}`}
              onClick={() => handleClick(tab)}
              disabled={isActive}
            >
              <span
                className={`bottom-tab-icon-slot ${
                  isActive ? 'is-active' : ''
                }`}
              >
                <Icon
                  color={isActive ? '#1447a6' : '#888'}
                  size={ICON_SIZE}
                  viewBox={tab.viewBox}
                />
              </span>
              <span
                className={`bottom-tab-label ${isActive ? 'is-active' : ''}`}
              >
                {tab.label}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default BottomTabBar;
