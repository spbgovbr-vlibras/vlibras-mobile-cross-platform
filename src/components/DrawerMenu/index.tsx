import React from 'react';

import { IonMenu } from '@ionic/react';

import './styles.css';

interface DrawerMenuProps {
  contentId: string;
}

function DrawerMenu({ contentId }: DrawerMenuProps) {
  return <IonMenu side="start" menuId="first" contentId={contentId} />;
}

export default DrawerMenu;
