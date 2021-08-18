import React, { useState } from 'react';

import { IonCol,IonImg, IonButton, IonRow, IonList, IonRadioGroup, IonListHeader, IonLabel, IonItem, IonRadio, IonContent, IonAlert } from '@ionic/react';
import { Strings } from './string';
import './styles.css';

import { useHistory } from 'react-router-dom';

import IconHandsTranslate from 'assets/icons/IconHandsTranslate';
import { PlayerKeys } from 'constants/player';
import { MenuLayout } from 'layouts';
// import PlayerService from 'services/unity';
import paths from '../../constants/paths';
import { reloadHistory } from 'utils/setHistory';
import { useSelector, useDispatch } from 'react-redux';
import { Creators, CustomizationState } from 'store/ducks/customization';
import  CustomizationArray  from 'data/CustomizationArray';
import  CustomizationBody  from 'data/CustomizationArrayBody';
import  CustomizationEye  from 'data/CustomizationArrayEye';

  import {
    IconEye,
    IconPants,
    IconBody,
    IconShirt,
    IconHair 
} from 'assets';
import CustomizationArrayBody from 'data/CustomizationArrayBody';
import CustomizationArrayEye from 'data/CustomizationArrayEye';


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

function Customization() {

  //States show
  const[colorbody,setcolorbody]= useState('#FEF8F2');
  const[coloreye,setcoloreye]= useState('#619FFB');
  const[colorhair,setcolorhair]= useState('#FB8C00');
  const[colorshirt,setcolorshirt]= useState('#FB8C00');
  const[colorpants,setcolorpants]= useState('#FB8C00');


  const[showbody,setshowbody]= useState(true);
  const[showeye,setshoweye]= useState(false);
  const[showhair,setshowhair]= useState(false);
  const[showshirt,setshowshirt]= useState(false);
  const[showpants,setshowpants]= useState(false);
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
 

// Selection Menu ( body, eye, shirt, pants, hair) -----------------------------------------------
//------------------------------------------------------------------------------------------------


  const showColorsBody = (item: CustomizationBody ) => {

    if (showbody==true) {
      return(
            <div
              className="customization-item-colors" 
              style={{borderColor:colorbody===item.colorBody?item.colorBody : 'white'}}
            >
              <button 
                className="customization-button-colors"
                style={{background:item.colorBody}} 
                type="button"
                onClick={()=>selectcolorbody(item.colorBody)}
                >
                </button>   
            </div>
        )
    }
  }
  const showColorsEye = (item: CustomizationEye) => {
    if (showeye==true) {
      return(
            <div className="customization-item-colors"  
            style={{borderColor:coloreye===item.colorEye?item.colorEye : 'white'}}
            >
              <button 
                className="customization-button-colors"
                style={{background:item.colorEye }}
                type="button"
                onClick={()=>selectcoloreye(item.colorEye)}
                >
                </button>   
            </div>
        )
    }
  }

  const showAllColors = (item: CustomizationArray ) => {

    if (showhair==true) {
      return(
            <div className="customization-item-colors"
            style={{borderColor:colorhair===item.color?item.color : 'white'}}
            >
              <button 
                className="customization-button-colors"
                style={{background:item.color }}
                type="button"
                onClick={()=>selectcolorhair(item.color)}
                >
                </button>   
            </div>
        )
    }

    if (showpants==true) {
      return(
            <div className="customization-item-colors"
            style={{borderColor:colorpants===item.color?item.color : 'white'}}
            >
              <button 
                className="customization-button-colors"
                style={{background:item.color }}
                type="button"
                onClick={()=>selectcolorpants(item.color)}
                >
                </button>   
            </div>
        )
    }
    
    if (showshirt==true) {
      return(
            <div className="customization-item-colors"
            style={{borderColor:colorshirt===item.color?item.color : 'white'}}
            >
              <button 
                className="customization-button-colors"
                style={{background:item.color }}
                type="button"
                onClick={()=>selectcolorshirt(item.color)}
                >
                </button>   
            </div>
        )
    }
  }



// criação da tela  ---------------------------------------------------------------
// --------------------------------------------------------------------------------
// --------------------------------------------------------------------------------




 return(
     <MenuLayout title="Personalização">
    <IonContent>
      <div className="customization-menu-principal">
      <div className="customization-menu">

          {/*button Body*/} 

            <button
            type="button"
            className="customization-button-menu"
            onClick={()=>showBody()}
            style={{borderBottomColor:showbody?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}}              
            >

            <IconBody color={showbody?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}/>  
            </button>  
      
                {/*button Eye*/} 

            <button
              className="customization-button-menu"
              type="button"
              onClick={()=>showEye()}
              style={{borderBottomColor:showeye?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}}
            >
              
            <IconEye color={showeye?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}/>  
            </button>  

              {/*button Hair*/} 

            <button
              className="customization-button-menu"
              type="button"
              onClick={()=>showHair()}
              style={{borderBottomColor:showhair?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}}              
              >
                <IconHair color={showhair?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}/>  
            </button>  

                  {/*button Shirt*/}         

           <button
              className="customization-button-menu"
              type="button"
              onClick={()=>showShirt()}
              style={{borderBottomColor:showshirt?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}}

            >
                <IconShirt color={showshirt?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE} />  
            </button>  

              {/*button Pants*/} 

           <button
              className="customization-button-menu"
              type="button"
              onClick={()=>showPants()}
              style={{borderBottomColor:showpants?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}}>
                 <IconPants color={showpants?buttonColors.VARIANT_WHITE_ACTIVE : buttonColors.VARAINT_WHITE}/>  
            </button>  
            
        </div>

          <IonList className="customization-list-colors">
              {CustomizationBody.map(item => showColorsBody(item))}
              {CustomizationEye.map(item => showColorsEye(item))}
              {CustomizationArray.map(item => showAllColors(item))}

          </IonList>

            </div>
    
        <div className="customization-all-save">
            <IonButton class="customization-save" 
              onClick={()=>SaveChanges()}
              disabled
            >
              {Strings.BUTTON_SALVAR}
            </IonButton>
        </div>

       { /*button cancel*/ }

        <IonAlert
          isOpen={showAlert}
          cssClass="popup-box-signal-cap"
          header={Strings.TITLE_POPUPCANCEL}
          message={Strings.MESSAGE_POPUPCANCEL}
          buttons={[
            {
              text: Strings.BUTTON_NAME_YES,
              cssClass: 'popup-yes',
              handler: () => {
                console.log('Confirm Yes');
                setshowAlert(false);
                history.push(paths.HOME);
              },
            },
            {
              text: Strings.BUTTON_NAME_NO,
              cssClass: 'popup-no',
              role: 'cancel',
              handler: () => {
                setshowAlert(false);
                console.log('Confirm No');
              },
            },
          ]}
        />

      </IonContent>
         </MenuLayout>
 )

}
export default Customization ;
