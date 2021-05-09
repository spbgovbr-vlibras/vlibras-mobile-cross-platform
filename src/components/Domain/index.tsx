import React, { useState } from 'react';
import { IonModal } from '@ionic/react';

import { Strings } from './strings';
import './styles.css';

const Domain = () => {
  const [showModal, setShowModal] = useState(true);
  const [domain, setDomain] = useState('saude');

  const setDomainVariable = (value: string) => {
    setDomain(value);
    setShowModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <IonModal
        isOpen={showModal}
        cssClass="domain-modal"
        swipeToClose={true}
        onDidDismiss={closeModal}
      >
        <p className="modal-onboarding-title">{Strings.TITLE_MODAL_DOMAIN}</p>
        <ul className="domain-list">
          <li onClick={() => setDomainVariable('saude')}>
            {Strings.FIRST_OPT_DOMAIN}
          </li>
          <li onClick={() => setDomainVariable('educacao')}>
            {Strings.SECOND_OPT_DOMAIN}
          </li>
          <li onClick={() => setDomainVariable('transito')}>
            {Strings.THIRD_OPT_DOMAIN}
          </li>
        </ul>
      </IonModal>
    </>
  );
};

export default Domain;
