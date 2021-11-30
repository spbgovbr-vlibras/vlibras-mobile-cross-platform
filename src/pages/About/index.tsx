import React from 'react';

import {
  IonContent,
  IonImg,
  IonText,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

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
  IconArrowLeft,
} from 'assets';

import { Strings } from './strings';

import './styles.css';

function About() {
  const history = useHistory();

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            {Strings.TOOLBAR_TITLE}
          </IonTitle>

          <IonButtons slot="start" onClick={() => history.goBack()}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
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
                <a href="https://www.instagram.com/vlibrasoficial/">
                  <IonImg
                    src={logoInstagram}
                    className="about-image-social-media"
                  />
                </a>
                <a href="https://www.facebook.com/vlibras/">
                  <IonImg
                    src={logoFacebook}
                    className="about-image-social-media"
                  />
                </a>
                <a href="https://www.youtube.com/channel/UCF94lq7TwAu5OmlwIu44qpA">
                  <IonImg
                    src={logoYoutube}
                    className="about-image-social-media"
                  />
                </a>
              </div>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default About;
