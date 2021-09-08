import React, { useState } from 'react';

import { IonCol, IonImg, IonButton, IonRow, IonList, IonRadioGroup, IonListHeader, IonLabel, IonItem, IonRadio, IonContent, IonAlert } from '@ionic/react';
import { Strings } from './string';
import './styles.css';

import { useHistory } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';
import PlayerService from 'services/unity';


import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import { PlayerKeys } from 'constants/player';
import { MenuLayout } from 'layouts';
// import PlayerService from 'services/unity';
import paths from '../../constants/paths';
import { reloadHistory } from 'utils/setHistory';
import { useSelector, useDispatch } from 'react-redux';
import { Creators, CustomizationState } from 'store/ducks/customization';
import CustomizationArrayPants from 'data/CustomizationArrayPants';
import CustomizationBody from 'data/CustomizationArrayBody';
import CustomizationArrayShirt from 'data/CustomizationArrayShirt';
import CustomizationArrayHair from 'data/CustomizationArrayHair';
import CustomizationEye from 'data/CustomizationArrayEye';

import { VideoOutputModal } from 'components';

import {
  IconEye,
  IconPants,
  IconBody,
  IconShirt,
  IconHair
} from 'assets';

import CustomizationArrayBody from 'data/CustomizationArrayBody';
import CustomizationArrayEye from 'data/CustomizationArrayEye';


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
}

function Customization() {

  //States show
  const [colorbody, setcolorbody] = useState(IcaroDefault.icaroBody);
  const [coloreye, setcoloreye] = useState(IcaroDefault.icaroEye);
  const [colorhair, setcolorhair] = useState(IcaroDefault.icaroHair);
  const [colorshirt, setcolorshirt] = useState(IcaroDefault.icaroShirt);
  const [colorpants, setcolorpants] = useState(IcaroDefault.icaroPants);
  //const [imageUrl, setImageUrl] = useState(getJsonColor.preview.logo);



  const [showbody, setshowbody] = useState(true);
  const [showeye, setshoweye] = useState(false);
  const [showhair, setshowhair] = useState(false);
  const [showshirt, setshowshirt] = useState(false);
  const [showpants, setshowpants] = useState(false);
  const [showAlert, setshowAlert] = useState(true);

  const dispatch = useDispatch();
  const history = useHistory();



  //  funções para alterar States

  const showBody = () => {

    setshowbody(true);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(false);

  }
  const showEye = () => {

    setshowbody(false);
    setshoweye(true);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(false);

  }
  const showHair = () => {

    setshowbody(false);
    setshoweye(false);
    setshowhair(true);
    setshowshirt(false);
    setshowpants(false);

  }

  const showShirt = () => {

    setshowbody(false);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(true);
    setshowpants(false);

  }

  const showPants = () => {
    setshowbody(false);
    setshoweye(false);
    setshowhair(false);
    setshowshirt(false);
    setshowpants(true);

  }

  function popupCancel() {
    setshowAlert(true);
  }

  const selectcolorbody = (color: string) => {

    setcolorbody(color);
    console.log(color);

  }
  const selectcoloreye = (color: string) => {

    setcoloreye(color);
    console.log(color);

  }
  const selectcolorhair = (color: string) => {

    setcolorhair(color);
    console.log(color);

  }
  const selectcolorpants = (color: string) => {

    setcolorpants(color);
    console.log(color);

  }
  const selectcolorshirt = (color: string) => {

    setcolorshirt(color);
    console.log(color);

  }

  function SaveChanges() {
    dispatch(Creators.setCurrentCustomizationBody(colorbody)); // redux create
    dispatch(Creators.setCurrentCustomizationEye(coloreye)); // redux create
    dispatch(Creators.setCurrentCustomizationHair(colorhair)); // redux create
    dispatch(Creators.setCurrentCustomizationPants(colorpants)); // redux create
    dispatch(Creators.setCurrentCustomizationShirt(colorshirt)); // redux create

    console.log(colorbody);
    console.log(coloreye);
    console.log(colorhair);
    console.log(colorpants);
    console.log(colorshirt);

    console.log("Cor salva com sucesso meu chapa");
  }

  //CUSTOMIZER ICARO 

  const preProcessingPreview = () => {
    const object = {
      corpo: colorbody,
      olhos: '#fffafa',
      cabelo: colorhair,
      camisa: colorshirt,
      calca: colorpants,
      iris: coloreye,
      pos: "center",

    };
    console.log(object)
    return JSON.stringify(object);
  };

  const previewAvatar = () => {
    unityContent.send(
      PlayerKeys.AVATAR,
      PlayerKeys.SETEDITOR,
      preProcessingPreview()
    );
  };

  // Selection Menu ( body, eye, shirt, pants, hair) -----------------------------------------------
  //------------------------------------------------------------------------------------------------

  const resetColor = () => {
    selectcolorbody(IcaroDefault.icaroBody)
    selectcoloreye(IcaroDefault.icaroEye)
    selectcolorhair(IcaroDefault.icaroHair)
    selectcolorpants(IcaroDefault.icaroPants)
    selectcolorshirt(IcaroDefault.icaroShirt)
    previewAvatar();
  }

  const showColorsBody = (item: CustomizationBody) => {

    if (showbody === true) {
      return (
        <div
          className="customization-item-colors"
          style={{ borderColor: colorbody === item.colorBody ? item.colorBody : 'white' }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.colorBody }}
            type="button"
            onClick={() => { selectcolorbody(item.colorBody); previewAvatar() }}
          >
          </button>
        </div>
      )
    }
  }
  const showColorsEye = (item: CustomizationEye) => {
    if (showeye === true) {
      return (
        <div className="customization-item-colors"
          style={{ borderColor: coloreye === item.colorEye ? item.colorEye : 'white' }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.colorEye }}
            type="button"
            onClick={() => { selectcoloreye(item.colorEye); previewAvatar() }}
          >
          </button>
        </div>
      )
    }
  }

  const showColorsHair = (item: CustomizationArray) => {

    if (showhair === true) {
      return (
        <div className="customization-item-colors"
          style={{ borderColor: colorhair === item.color ? item.color : 'white' }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => { selectcolorhair(item.color); previewAvatar() }}
          >
          </button>
        </div>
      )
    }
  }
  const showColorPants = (item: CustomizationArray) => {
    if (showpants === true) {
      return (
        <div className="customization-item-colors"
          style={{ borderColor: colorpants === item.color ? item.color : 'white' }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => { selectcolorpants(item.color); previewAvatar() }}
          >
          </button>
        </div>
      )
    }
  }

  const showColorShirt = (item: CustomizationArray) => {
    if (showshirt === true) {
      return (
        <div className="customization-item-colors"
          style={{ borderColor: colorshirt === item.color ? item.color : 'white' }}
        >
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => { selectcolorshirt(item.color); previewAvatar() }}
          >
          </button>
        </div>
      )
    }

  }


  // criação da tela  ---------------------------------------------------------------
  // --------------------------------------------------------------------------------
  // --------------------------------------------------------------------------------




  return (
    <MenuLayout title="Personalização">
      <div className="player-container">

        <div className="player-container"
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
          <Unity
            unityContent={unityContent}
            className="player-content"
          />
        </div>

        <div className="customization-menu">

          {/*button Body*/}

          <button
            type="button"
            className="customization-button-menu"
            onClick={() => showBody()}
            style={{ borderBottomColor: showbody ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE }}
          >

            <IconBody color={showbody ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />
          </button>

          {/*button Eye*/}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showEye()}
            style={{ borderBottomColor: showeye ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE }}
          >

            <IconEye color={showeye ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />
          </button>

          {/*button Hair*/}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showHair()}
            style={{ borderBottomColor: showhair ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE }}
          >
            <IconHair color={showhair ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />
          </button>

          {/*button Shirt*/}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showShirt()}
            style={{ borderBottomColor: showshirt ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE }}

          >
            <IconShirt color={showshirt ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />
          </button>

          {/*button Pants*/}

          <button
            className="customization-button-menu"
            type="button"
            onClick={() => showPants()}
            style={{ borderBottomColor: showpants ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE }}>
            <IconPants color={showpants ? buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />
          </button>

        </div>

        <IonList className="customization-list-colors">
          {CustomizationBody.map(item => showColorsBody(item))}
          {CustomizationEye.map(item => showColorsEye(item))}
          {CustomizationArrayHair.map(item => showColorsHair(item))}
          {CustomizationArrayShirt.map(item => showColorShirt(item))}
          {CustomizationArrayPants.map(item => showColorPants(item))}


        </IonList>
        <button onClick={() => resetColor()}>Reset Color</button>
        
        <div className="customization-all-save">
          <IonButton class="customization-save"
            onClick={() => SaveChanges()}
          //disabled
          >
            {Strings.BUTTON_SALVAR}
          </IonButton>
        </div>
      </div>
    </MenuLayout>
  )

}
export default Customization;
