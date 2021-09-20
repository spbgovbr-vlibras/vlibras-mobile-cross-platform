import React, { useState, useEffect } from 'react';

import {
  IonCol,
  IonImg,
  IonButton,
  IonRow,
  IonList,
  IonRadioGroup,
  IonListHeader,
  IonLabel,
  IonItem,
  IonRadio,
  IonContent,
  IonAlert,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
} from '@ionic/react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';

import {
  IconEye,
  IconPants,
  IconBody,
  IconShirt,
  IconHair,
  IconArrowLeft,
} from 'assets';
import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import { VideoOutputModal } from 'components';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import CustomizationBody from 'data/CustomizationArrayBody';
import CustomizationEye from 'data/CustomizationArrayEye';
import CustomizationArrayHair from 'data/CustomizationArrayHair';
import CustomizationArrayPants from 'data/CustomizationArrayPants';
import CustomizationArrayShirt from 'data/CustomizationArrayShirt';
import { MenuLayout } from 'layouts';
import PlayerService from 'services/unity';
import { Creators, CustomizationState } from 'store/ducks/customization';
import { reloadHistory } from 'utils/setHistory';

import { Strings } from './string';

import './styles.css';

const unityContent = new UnityContent(
  'Build-Final/Build/NOVABUILD.json',
  'Build-Final/Build/UnityLoader.js',
  {
    adjustOnWindowResize: true,
  },
);

const playerService = PlayerService.getService();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

export interface CustomizationArray {
  color: string;
}
export interface CustomizationBody {
  colorBody: string;
}
export interface CustomizationEye {
  colorEye: string;
}

const IcaroDefault = {
  icaroBody: '#b87d6c',
  icaroEye: '#000000',
  icaroHair: '#000000',
  icaroShirt: '#202763',
  icaroPants: '#121420',
};

function Customization() {
  // States show
  const [colorbody, setcolorbody] = useState(IcaroDefault.icaroBody);
  const [coloreye, setcoloreye] = useState(IcaroDefault.icaroEye);
  const [colorhair, setcolorhair] = useState(IcaroDefault.icaroHair);
  const [colorshirt, setcolorshirt] = useState(IcaroDefault.icaroShirt);
  const [colorpants, setcolorpants] = useState(IcaroDefault.icaroPants);
  // const [imageUrl, setImageUrl] = useState(getJsonColor.preview.logo);

  const [showbody, setshowbody] = useState(true);
  const [showeye, setshoweye] = useState(false);
  const [showhair, setshowhair] = useState(false);
  const [showshirt, setshowshirt] = useState(false);
  const [showpants, setshowpants] = useState(false);
  const [showAlert, setshowAlert] = useState(false);
  const [showAlertCancel, setshowAlertCancel] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  //  funções para alterar States

  const showBody = () => {
    setshowbody(true);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(false);
  };
  const showEye = () => {
    setshowbody(false);
    setshoweye(true);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(false);
  };
  const showHair = () => {
    setshowbody(false);
    setshoweye(false);
    setshowhair(true);
    setshowshirt(false);
    setshowpants(false);
  };

  const showShirt = () => {
    setshowbody(false);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(true);
    setshowpants(false);
  };

  const showPants = () => {
    setshowbody(false);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(true);
  };

  function popupCancel() {
    setshowAlert(true);
  }

  const selectcolorbody = (color: string) => {
    setcolorbody(color);
  };
  const selectcoloreye = (color: string) => {
    setcoloreye(color);
  };
  const selectcolorhair = (color: string) => {
    setcolorhair(color);
  };
  const selectcolorpants = (color: string) => {
    setcolorpants(color);
  };
  const selectcolorshirt = (color: string) => {
    setcolorshirt(color);
  };

  function SaveChanges() {
    dispatch(Creators.setCurrentCustomizationBody(colorbody)); // redux create
    dispatch(Creators.setCurrentCustomizationEye(coloreye)); // redux create
    dispatch(Creators.setCurrentCustomizationHair(colorhair)); // redux create
    dispatch(Creators.setCurrentCustomizationPants(colorpants)); // redux create
    dispatch(Creators.setCurrentCustomizationShirt(colorshirt)); // redux create

    history.push(paths.HOME);
  }

  // CUSTOMIZER ICARO

  useEffect(() => {
    const preProcessingPreview = JSON.stringify({
      corpo: colorbody,
      olhos: '#fffafa',
      cabelo: colorhair,
      camisa: colorshirt,
      calca: colorpants,
      iris: coloreye,
      pos: 'center',
    });

    unityContent.send(
      PlayerKeys.AVATAR,
      PlayerKeys.SETEDITOR,
      preProcessingPreview,
    );
  }, [colorbody, colorhair, colorshirt, colorpants, coloreye]);

  // Selection Menu ( body, eye, shirt, pants, hair) -----------------------------------------------
  //------------------------------------------------------------------------------------------------

  const resetColor = () => {
    selectcolorbody(IcaroDefault.icaroBody);
    selectcoloreye(IcaroDefault.icaroEye);
    selectcolorhair(IcaroDefault.icaroHair);
    selectcolorpants(IcaroDefault.icaroPants);
    selectcolorshirt(IcaroDefault.icaroShirt);

    dispatch(Creators.setCurrentCustomizationBody(IcaroDefault.icaroBody)); // redux create
    dispatch(Creators.setCurrentCustomizationEye(IcaroDefault.icaroEye)); // redux create
    dispatch(Creators.setCurrentCustomizationHair(IcaroDefault.icaroHair)); // redux create
    dispatch(Creators.setCurrentCustomizationPants(IcaroDefault.icaroPants)); // redux create
    dispatch(Creators.setCurrentCustomizationShirt(IcaroDefault.icaroShirt)); // redux create
  };

  const showColorsBody = (item: CustomizationBody) => {
    if (showbody) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor:
              colorbody === item.colorBody ? item.colorBody : 'white',
          }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.colorBody }}
            type="button"
            onClick={() => {
              selectcolorbody(item.colorBody);
            }}
          >
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };
  const showColorsEye = (item: CustomizationEye) => {
    if (showeye) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: coloreye === item.colorEye ? item.colorEye : 'white',
          }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.colorEye }}
            type="button"
            onClick={() => {
              selectcoloreye(item.colorEye);
            }}
          >
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorsHair = (item: CustomizationArray) => {
    if (showhair) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorhair === item.color ? item.color : 'white',
          }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorhair(item.color);
            }}
          >
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorPants = (item: CustomizationArray) => {
    if (showpants) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorpants === item.color ? item.color : 'white',
          }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorpants(item.color);
            }}
          >
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorShirt = (item: CustomizationArray) => {
    if (showshirt) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorshirt === item.color ? item.color : 'white',
          }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorshirt(item.color);
            }}
          >
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  /*   const showPopUpReset = () => {
    <IonAlert
      isOpen={showAlert}
      cssClass="popup-box-signal-cap"
      header={Strings.TITLE_POPUP_RESET}
      message={Strings.MESSAGE_POPUPCANCEL}
      buttons={[
        {
          text: Strings.BUTTON_NAME_YES,
          cssClass: 'popup-yes',
          handler: () => {
            console.log('Confirm Yes');
            setshowAlert(false);
            resetColor();
          },
        },
        {
          text: Strings.BUTTON_NAME_NO,
          cssClass: 'popup-no',
          role: 'cancel',
          handler: () => {
            console.log('Confirm No');
            setshowAlert(false);
          },
        },
      ]}
    />;
  };
 */
  // criação da tela  ---------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title-signalcap">
            Personalização
          </IonTitle>

          <IonButtons slot="start" onClick={() => setshowAlertCancel(true)}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="#1447a6" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <div className="player-container">
        <div
          className="player-container"
          style={{
            width: '100vw',
            // visibility: visiblePlayer ? 'visible' : 'hidden',
            zIndex: 0,
            flexShrink: 0,
            flex: 1,
            display: 'flex',
            // backgroundColor: '#000',
          }}
        >
          <Unity unityContent={unityContent} className="player-content" />
        </div>

        <div className="customization-menu">
          {/* button Body */}

          <button
            type="button"
            className="customization-button-menu"
            onClick={() => showBody()}
            style={{
              borderBottomColor: showbody
                ? buttonColors.VARIANT_WHITE_ACTIVE
                : buttonColors.VARAINT_WHITE,
            }}
          >
            <IconBody
              color={
                showbody
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
            />
          </button>

          {/* button Eye */}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showEye()}
            style={{
              borderBottomColor: showeye
                ? buttonColors.VARIANT_WHITE_ACTIVE
                : buttonColors.VARAINT_WHITE,
            }}
          >
            <IconEye
              color={
                showeye
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
            />
          </button>

          {/* button Hair */}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showHair()}
            style={{
              borderBottomColor: showhair
                ? buttonColors.VARIANT_WHITE_ACTIVE
                : buttonColors.VARAINT_WHITE,
            }}
          >
            <IconHair
              color={
                showhair
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
            />
          </button>

          {/* button Shirt */}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showShirt()}
            style={{
              borderBottomColor: showshirt
                ? buttonColors.VARIANT_WHITE_ACTIVE
                : buttonColors.VARAINT_WHITE,
            }}
          >
            <IconShirt
              color={
                showshirt
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
            />
          </button>

          {/* button Pants */}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showPants()}
            style={{
              borderBottomColor: showpants
                ? buttonColors.VARIANT_WHITE_ACTIVE
                : buttonColors.VARAINT_WHITE,
            }}
          >
            <IconPants
              color={
                showpants
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE
              }
            />
          </button>
        </div>

        <IonList className="customization-list-colors">
          {CustomizationBody.map(item => showColorsBody(item))}
          {CustomizationEye.map(item => showColorsEye(item))}
          {CustomizationArrayHair.map(item => showColorsHair(item))}
          {CustomizationArrayShirt.map(item => showColorShirt(item))}
          {CustomizationArrayPants.map(item => showColorPants(item))}
        </IonList>
        {/* <button onClick={() => resetColor()} type="button">
          Reset Color
        </button> */}

        <div className="customization-all-save">
          <button
            className="customization-reset"
            onClick={() => setshowAlert(true)}
            type="button"
          >
            {Strings.BUTTON_RESET}
            <IonAlert
              isOpen={showAlert}
              cssClass="popup-box-signal-cap"
              header={Strings.TITLE_POPUP_RESET}
              message={Strings.MESSAGE_POPUPCANCEL}
              buttons={[
                {
                  text: Strings.BUTTON_NAME_YES,
                  cssClass: 'popup-yes',
                  handler: () => {
                    setshowAlert(false);
                    resetColor();
                  },
                },
                {
                  text: Strings.BUTTON_NAME_NO,
                  cssClass: 'popup-no',
                  role: 'cancel',
                  handler: () => {
                    setshowAlert(false);
                  },
                },
              ]}
            />
            <IonAlert
              isOpen={showAlertCancel}
              cssClass="popup-box-signal-cap"
              header={Strings.TITLE_POPUPCANCEL}
              message={Strings.MESSAGE_POPUPCANCEL}
              buttons={[
                {
                  text: Strings.BUTTON_NAME_YES,
                  cssClass: 'popup-yes',
                  handler: () => {
                    setshowAlertCancel(false);
                    history.push(paths.HOME);
                  },
                },
                {
                  text: Strings.BUTTON_NAME_NO,
                  cssClass: 'popup-no',
                  role: 'cancel',
                  handler: () => {
                    setshowAlertCancel(false);
                  },
                },
              ]}
            />
          </button>
          <button
            className="customization-save"
            onClick={() => SaveChanges()}
            type="button"
          >
            {Strings.BUTTON_SALVAR}
          </button>
        </div>
      </div>
    </IonPage>
  );
}
export default Customization;
