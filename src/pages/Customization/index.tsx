import {
  IonList,
  IonAlert,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  isPlatform,
} from '@ionic/react';
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import Unity, { UnityContent } from 'react-unity-webgl';

import {
  IconEye,
  IconPants,
  IconBody,
  IconShirt,
  IconHair,
  IconArrowLeft,
  IconTutorial,
} from 'assets';
import ErrorModal from 'components/ErrorModal';
import LoadingModal from 'components/LoadingModal';
import TutorialPopover from 'components/TutorialPopover';
import paths from 'constants/paths';
import { PlayerKeys } from 'constants/player';
import { updateAvatarCustomizationProperties } from 'data/AvatarCustomizationProperties';
import CustomizationBody from 'data/CustomizationArrayBody';
import CustomizationEye from 'data/CustomizationArrayEye';
import CustomizationArrayHair from 'data/CustomizationArrayHair';
import CustomizationArrayPants from 'data/CustomizationArrayPants';
import CustomizationArrayShirt from 'data/CustomizationArrayShirt';
import { CustomizationTutorialSteps, useCustomizationTutorial } from 'hooks/CustomizationTutorial';
import { useLoadCurrentAvatar } from 'hooks/useLoadCurrentAvatar';
import UnityService from 'services/unity';
import { RootState } from 'store';
import { Creators, CustomizationState } from 'store/ducks/customization';

import { Strings } from './string';
import './styles.css';

const unityContent = UnityService.getEditorInstance().getUnity();

const buttonColors = {
  VARIANT_BLUE: '#FFF',
  VARAINT_WHITE: '#939293',
  VARIANT_WHITE_ACTIVE: '#003F86',
};

export interface CustomizationArrayHair {
  color: string;
}
export interface CustomizationArrayPants {
  color: string;
}
export interface CustomizationArrayShirt {
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

function hasChanges(
  current: {
    colorbody: string;
    coloreye: string;
    colorhair: string;
    colorshirt: string;
    colorpants: string;
  },
  currentSaved: CustomizationState
): boolean {
  return (
    current.colorbody !== currentSaved.currentbody ||
    current.coloreye !== currentSaved.currenteye ||
    current.colorhair !== currentSaved.currenthair ||
    current.colorpants !== currentSaved.currentpants ||
    current.colorshirt !== currentSaved.currentshirt
  );
}

function Customization() {
  const currentAvatar = useSelector(
    ({ customization }: RootState) => customization.currentavatar
  );

  const currentBody = useSelector(
    ({ customization }: RootState) => customization.currentbody
  );
  const currentEye = useSelector(
    ({ customization }: RootState) => customization.currenteye
  );

  const currentHair = useSelector(
    ({ customization }: RootState) => customization.currenthair
  );

  const currentShirt = useSelector(
    ({ customization }: RootState) => customization.currentshirt
  );

  const currentPants = useSelector(
    ({ customization }: RootState) => customization.currentpants
  );

  const currentCustomization = useSelector(
    ({ customization }: RootState) => customization
  );

  const [visiblePlayer, setVisiblePlayer] = useState(false);

  // States show
  const [colorbody, setcolorbody] = useState(currentBody);
  const [coloreye, setcoloreye] = useState(currentEye);
  const [colorhair, setcolorhair] = useState(currentHair);
  const [colorshirt, setcolorshirt] = useState(currentShirt);
  const [colorpants, setcolorpants] = useState(currentPants);

  // const [imageUrl, setImageUrl] = useState(getJsonColor.preview.logo);

  const [showbody, setshowbody] = useState(true);
  const [showeye, setshoweye] = useState(false);
  const [showhair, setshowhair] = useState(false);
  const [showshirt, setshowshirt] = useState(false);
  const [showpants, setshowpants] = useState(false);
  const [showAlert, setshowAlert] = useState(false);
  const [showAlertCancel, setshowAlertCancel] = useState(false);

  // modals management
  const [showloadingModal, setShowloadingModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    unityContent.on('progress', (progression: any) => {
      if (progression === 1) {
        dispatch(Creators.loadCustomization.request({}));
        setVisiblePlayer(true);
      }
    });
  }, [dispatch]);

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

  useLoadCurrentAvatar(
    currentAvatar,
    UnityService.getEditorInstance(),
    currentAvatar
  );

  function SaveChanges() {
    try {
      dispatch(Creators.setCurrentCustomizationBody(colorbody)); // redux create
      dispatch(Creators.setCurrentCustomizationEye(coloreye)); // redux create
      dispatch(Creators.setCurrentCustomizationHair(colorhair)); // redux create
      dispatch(Creators.setCurrentCustomizationPants(colorpants)); // redux create
      dispatch(Creators.setCurrentCustomizationShirt(colorshirt)); // redux create
      dispatch(
        Creators.storeCustomization.request({
          corpo: colorbody,
          cabelo: colorhair,
          camisa: colorshirt,
          calca: colorpants,
          iris: coloreye,
        })
      );
      openLoadingModal();
    } catch (error) {
      openErrorModal();
    }
  }

  const rollbackCustomization = useCallback(() => {
    selectcolorbody(currentBody);
    selectcolorhair(currentHair);
    setcolorshirt(currentShirt);
    selectcolorpants(currentPants);
    selectcoloreye(currentEye);

    const customizedAvatar = updateAvatarCustomizationProperties({
      avatar: currentAvatar,
      corpo: currentBody,
      cabelo: currentHair,
      camisa: currentShirt,
      calca: currentPants,
      iris: currentEye,
    });

    const preProcessingPreview = JSON.stringify(customizedAvatar);

    unityContent.send(
      PlayerKeys.CUSTOMIZATION_BRIDGE,
      PlayerKeys.APPLY_JSON,
      preProcessingPreview
    );
  }, [
    currentBody,
    currentHair,
    currentShirt,
    currentPants,
    currentEye,
    currentAvatar,
  ]);

  // CUSTOMIZER ICARO

  useEffect(() => {
    if (visiblePlayer) {
      rollbackCustomization();
    }
  }, [visiblePlayer, rollbackCustomization]);

  useEffect(() => {
    const customizedAvatar = updateAvatarCustomizationProperties({
      avatar: currentAvatar,
      corpo: colorbody,
      cabelo: colorhair,
      camisa: colorshirt,
      calca: colorpants,
      iris: coloreye,
    });
    const preProcessingPreview = JSON.stringify(customizedAvatar);

    unityContent.send(
      PlayerKeys.CUSTOMIZATION_BRIDGE,
      PlayerKeys.APPLY_JSON,
      preProcessingPreview
    );
  }, [colorbody, colorhair, colorshirt, colorpants, coloreye, currentAvatar]);

  // Selection Menu ( body, eye, shirt, pants, hair) -----------------------------------------------
  // ------------------------------------------------------------------------------------------------

  const resetColor = () => {
    selectcolorbody(IcaroDefault.icaroBody);
    selectcoloreye(IcaroDefault.icaroEye);
    selectcolorhair(IcaroDefault.icaroHair);
    selectcolorpants(IcaroDefault.icaroPants);
    selectcolorshirt(IcaroDefault.icaroShirt);
  };

  const cancelAndReturnToHome = useCallback(() => {
    rollbackCustomization();
    history.push(paths.HOME);
  }, [rollbackCustomization, history]);

  const onCloseClick = useCallback(() => {
    onCancel();
    cancelAndReturnToHome();
    // if (
    //   hasChanges(
    //     { colorbody, colorpants, coloreye, colorhair, colorshirt },
    //     currentCustomization
    //   )
    // ) {
    //   setshowAlertCancel(true);
    // } else {
    //   cancelAndReturnToHome();
    // }
  }, [
    colorbody,
    colorpants,
    coloreye,
    colorhair,
    colorshirt,
    currentCustomization,
    setshowAlertCancel,
    cancelAndReturnToHome,
  ]);

  const showColorsBody = (item: CustomizationBody) => {
    if (showbody) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor:
              colorbody === item.colorBody ? item.colorBody : 'white',
          }}>
          <button
            className="customization-button-colors"
            style={{ background: item.colorBody }}
            type="button"
            onClick={() => {
              selectcolorbody(item.colorBody);
            }}>
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
          }}>
          <button
            className="customization-button-colors"
            style={{ background: item.colorEye }}
            type="button"
            onClick={() => {
              selectcoloreye(item.colorEye);
            }}>
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorsHair = (item: CustomizationArrayHair) => {
    if (showhair) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorhair === item.color ? item.color : 'white',
          }}>
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorhair(item.color);
            }}>
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorPants = (item: CustomizationArrayPants) => {
    if (showpants) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorpants === item.color ? item.color : 'white',
          }}>
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorpants(item.color);
            }}>
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const showColorShirt = (item: CustomizationArrayShirt) => {
    if (showshirt) {
      return (
        <div
          className="customization-item-colors"
          style={{
            borderColor: colorshirt === item.color ? item.color : 'white',
          }}>
          <button
            className="customization-button-colors"
            style={{ background: item.color }}
            type="button"
            onClick={() => {
              selectcolorshirt(item.color);
            }}>
            &#8203;
          </button>
        </div>
      );
    }
    return null;
  };

  const [showSelectedBodyPart, setShowSelectedBodyPart] = useState('');

  useEffect(() => {
    if (showbody) {
      setShowSelectedBodyPart('Corpo');
    } else if (showeye) {
      setShowSelectedBodyPart('Olhos');
    } else if (showhair) {
      setShowSelectedBodyPart('Cabelo');
    } else if (showshirt) {
      setShowSelectedBodyPart('Camisa');
    } else if (showpants) {
      setShowSelectedBodyPart('Calça');
    }
    setTimeout(() => {
      setShowSelectedBodyPart('');
    }, 3000);
  }, [showbody, showeye, showhair, showshirt, showpants]);

  const {
    currentStep,
    presentTutorial,
    onCancel,
  } = useCustomizationTutorial();

  // modals management ---------------------------------------------------------
  const closeLoadingModal = useCallback(() => {
    setShowloadingModal(false);
  }, [setShowloadingModal]);

  const openLoadingModal = useCallback(() => {
    setShowloadingModal(true);
    setTimeout(() => {
      closeLoadingModal();
      history.goBack();
    }, 2000);
  }, [setShowloadingModal, closeLoadingModal, history]);

  const closeErrorModal = useCallback(() => {
    setShowErrorModal(false);
  },[setShowErrorModal]);

  const openErrorModal = useCallback(() => {
    setShowErrorModal(true);
    setTimeout(() => {
      closeErrorModal();
    }, 3000);
  }, [setShowErrorModal, closeErrorModal]);
  // ---------------------------------------------------------------------------

  // criação da tela  ----------------------------------------------------------
  return (
    <IonPage>
      <ErrorModal
        show={showErrorModal}
        setShow={closeErrorModal}
        errorMsg='Erro ao salvar alterações. Tente novamente.'
      />
      <LoadingModal
        loading={showloadingModal}
        setLoading={setShowloadingModal}
        text="Salvando alterações..."
        canDismiss={false}
      />
      <div style={{position:'relative', display:'flex', flexDirection:'row'}}>
        <p
          style={{
            position:'absolute',
            color:'black',
            right: '40%',
            top: '-2vh',
            fontSize: '1.5rem',
            zIndex: 3
          }}>
          {showSelectedBodyPart}
        </p>
        <button
          className="player-button-tutorial-rounded-top"
          type="button"
          onClick={presentTutorial}
          style={{
            position: 'absolute',
            top: '2vh',
            right: '2vh',
            zIndex: 9999,
          }}>
          <IconTutorial color='black' size={44}/>
        </button>
      </div>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle className="menu-toolbar-title">
            Personalização
          </IonTitle>

          <IonButtons slot="start" onClick={onCloseClick}>
            <div className="arrow-left-container-start">
              <IconArrowLeft color="var(--VLibras---Light-Black-1, #363636)" />
            </div>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <div className="player-container">
        <div
          style={{
            width: '100vw',
            zIndex: 0,
            flexShrink: 1,
            flex: 1,
            display: 'flex',
            background:
              isPlatform('ios') && visiblePlayer ? 'black' : '#E5E5E5',
          }}>
          <Unity unityContent={unityContent} className="player-content" />
        </div>
        {currentStep === CustomizationTutorialSteps.BODY_PARTS && (
          <div style={{position:'relative'}}>
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: 0,
                left: 25,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                zIndex: 9999,
              }}>
              <TutorialPopover
                title="Corpo"
                context='customization'
                description="Personalize o avatar de acordo com as características"
                position="bc"
                isEnabled={true}
              />
            </div>
          </div>
        )}
        {currentStep === CustomizationTutorialSteps.COLORS && (
          <div style={{position:'relative'}}>
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: -60,
                left: 25,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                zIndex: 9999,
              }}>
              <TutorialPopover
                title="Cores"
                context='customization'
                description="Selecione a cor que desejadar para a parte do corpo "
                position="bc"
                isEnabled={true}
              />
            </div>
          </div>
        )}

        {currentStep === CustomizationTutorialSteps.BUTTONS && (
          <div style={{position:'relative'}}>
            <div
              style={{
                margin: 'auto',
                position: 'absolute',
                bottom: -120,
                left: 25,
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100vw',
                zIndex: 9999,
              }}>
              <TutorialPopover
                title="Salvar ou redefinir"
                context='customization'
                description="Redefina para as cores padrões ou Salve as alterações aplicadas"
                position="bc"
                isEnabled={true}
              />
            </div>
          </div>
        )}
        <div className="container-menu">
          {/* Simple solution to desable the menu during tutorial */}
          {currentStep !== 0 ? (
            <div style={{position:'absolute',background:'transparent',width:'100%', height:'100%',zIndex:3}}/>
          ) : null}
          <div className="customization-menu">
            {currentStep === CustomizationTutorialSteps.BODY_PARTS && (
              <div
                style={{
                  position: 'absolute',
                  left: '0',
                  width: '100%',
                  height: '5%',
                  borderRadius: 50,
                  border: '2px solid #3885F9',
                  boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
                  zIndex: 9999,
                }}>
              </div>
            )}
            {/* button Body */}
            <button
              type="button"
              className="customization-button-menu"
              onClick={() =>{
                showBody();

              }}
              style={{
                borderBottomColor: showbody
                  ? buttonColors.VARIANT_WHITE_ACTIVE
                  : buttonColors.VARAINT_WHITE,
              }}
              disabled={currentStep !== 0}>
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
              disabled={currentStep !== 0}>
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
              disabled={currentStep !== 0}>
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
              disabled={currentStep !== 0}>
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
              disabled={currentStep !== 0}>
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
            { currentStep === CustomizationTutorialSteps.COLORS && (
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '60%',
                  borderRadius: 50,
                  border: '2px solid #3885F9',
                  boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
                  zIndex: 9999,
                  left: '0',
                }}>
              </div>
            )}
            {CustomizationBody.map((item) => showColorsBody(item))}
            {CustomizationEye.map((item) => showColorsEye(item))}
            {CustomizationArrayHair.map((item) => showColorsHair(item))}
            {CustomizationArrayShirt.map((item) => showColorShirt(item))}
            {CustomizationArrayPants.map((item) => showColorPants(item))}
          </IonList>
          {/* <button onClick={() => resetColor()} type="button">
            Reset Color
          </button> */}

          <div className="customization-all-save">
            { currentStep === CustomizationTutorialSteps.BUTTONS && (
              <div
                style={{
                  position: 'absolute',
                  width: '60%',
                  height: '7%',
                  borderRadius: 50,
                  border: '2px solid #3885F9',
                  boxShadow: '0px 0px 15px 0px rgba(86, 154, 255, 0.75)',
                  zIndex: 9999,
                  left: '20%',
                }}>
              </div>
            )}
            <button
              className="customization-reset"
              onClick={() => setshowAlert(true)}
              type="button"
              disabled={currentStep !== 0}>
              {Strings.BUTTON_RESET}
              {/* <IonAlert
                isOpen={showAlertCancel}
                className="popup-box-signal-cap"
                header={Strings.TITLE_POPUPCANCEL}
                message={Strings.MESSAGE_POPUPCANCEL}
                onDidDismiss={() => setshowAlertCancel(false)}
                buttons={[
                  {
                    text: Strings.BUTTON_NAME_YES,
                    cssClass: 'popup-yes',
                    handler: cancelAndReturnToHome,
                  },
                  {
                    text: Strings.BUTTON_NAME_NO,
                    cssClass: 'popup-no',
                    role: 'cancel',
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    handler: () => {},
                  },
                ]}
              /> */}
              <IonAlert
                isOpen={showAlert}
                className="popup-box-signal-cap"
                header={Strings.TITLE_POPUP_RESET}
                message={Strings.MESSAGE_POPUPCANCEL}
                onDidDismiss={() => setshowAlert(false)}
                buttons={[
                  {
                    text: Strings.BUTTON_NAME_YES,
                    cssClass: 'popup-yes',
                    handler: () => {
                      resetColor();
                    },
                  },
                  {
                    text: Strings.BUTTON_NAME_NO,
                    cssClass: 'popup-no',
                    role: 'cancel',
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    handler: () => {},
                  },
                ]}
              />
            </button>
            <button
              className="customization-save"
              onClick={() => SaveChanges()}
              type="button"
              disabled={currentStep !== 0}>
              {Strings.BUTTON_SALVAR}
            </button>
          </div>
        </div>
      </div>
    </IonPage>
  );
}
export default Customization;
