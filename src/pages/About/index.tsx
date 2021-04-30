import React from 'react';

import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { shareSocial, menu } from 'ionicons/icons';

import {
  logoAvatares,
  logoCamaraDeputados,
  logoFacebook,
  logoInstagram,
  logoLavid,
  logoRealizadores,
  logoRnp,
  logoUfpb,
  logoYoutube,
} from 'assets';

import { Strings } from './strings';
import './styles.css';

function About() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar class="about-toolbar">
          <IonTitle class="about-toolbar-title">
            {Strings.TOOLBAR_TITLE}
          </IonTitle>

          <IonButtons slot="start">
            <IonButton>
              <IonIcon icon={menu} class="about-toolbar-icon" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton>
              <IonIcon icon={shareSocial} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div className="about-box-content">
          <h1 className="about-box-text-suite">
            {Strings.CHARACTERS_TEXT_SUITE}
            <br />
            <span className="about-box-text-vlibras">
              {Strings.CHARACTERS_TEXT_VLIBRAS}
            </span>
          </h1>
          <IonImg class="about-container-characters" src={logoAvatares} />
        </div>
        <div className="about-content">
          <div className="about-content-text-vlibras">
            <IonText>{Strings.TEXT_VLIBRAS}</IonText>
          </div>
          <div className="about-container-realizadores">
            <IonText>{Strings.TEXT_REALIZADORES}</IonText>
            <IonImg class="about-image-realizadores" src={logoRealizadores} />
            <div className="about-container-realizadores-footer">
              <IonImg src={logoCamaraDeputados} />
              <IonImg src={logoLavid} />
              <IonImg src={logoUfpb} />
              <IonImg src={logoRnp} />
            </div>
            <div className="about-container-redes-sociais">
              <IonText>{Strings.TEXT_REDES_SOCIAIS}</IonText>
              <div className="about-container-redes-sociais-footer">
                <IonImg src={logoInstagram} />
                <IonImg src={logoFacebook} />
                <IonImg src={logoYoutube} />
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default About;
