import { NativeStorage } from '@ionic-native/native-storage';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

export enum TutorialSteps {
  IDLE,
  INITIAL,
  TRANSLATION,
  DICTIONARY,
  HISTORY,
  TUTORIAL,
  CHANGE_AVATAR,
  MENU,
  CLOSE,
  LIKED_TRANSLATION,
  SHARE,
  SUBTITLE,
  REPEAT,
  PLAYBACK_SPEED,
}

interface TutorialContextData {
  currentStep: TutorialSteps;
  goNextStep: () => void;
  onCancel: () => void;
  currentStepIndex: number;
  alwaysShowTutorial: boolean;
  setAlwaysShowTutorial: (alwaysShow: boolean) => void;
  hasLoadedConfigurations: boolean;
}

const TutorialContext = createContext<TutorialContextData>(
  {} as TutorialContextData
);

export const TUTORIAL_QUEUE = [
  TutorialSteps.TRANSLATION,
  TutorialSteps.DICTIONARY,
  TutorialSteps.HISTORY,
  TutorialSteps.TUTORIAL,
  TutorialSteps.CHANGE_AVATAR,
  TutorialSteps.MENU,
  TutorialSteps.CLOSE,
  TutorialSteps.LIKED_TRANSLATION,
  TutorialSteps.SHARE,
  TutorialSteps.SUBTITLE,
  TutorialSteps.REPEAT,
  TutorialSteps.PLAYBACK_SPEED,
];

const PROPERTY_KEY_TUTORIAL = 'tutorial';
const PROPERTY_KEY_PRESENT_TUTORIAL = 'present-tutorial';

const TutorialProvider: React.FC = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<TutorialSteps>(
    TutorialSteps.INITIAL
  );
  const [alwaysShowTutorial, setAlwaysShowTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasLoadedConfigurations, setHasLoadedConfigurations] = useState(false);

  const onSetAlwaysShowTutorialPreference = (alwaysShow: boolean) => {
    setAlwaysShowTutorial(alwaysShow);
    NativeStorage.setItem(PROPERTY_KEY_PRESENT_TUTORIAL, alwaysShow);
  };

  const presentTutorial = useCallback(() => {
    setCurrentStep(TutorialSteps.INITIAL);
    setCurrentStepIndex(-1);
  }, []);

  const markTutorialAsSeen = useCallback(() => {
    NativeStorage.setItem(PROPERTY_KEY_TUTORIAL, true);
  }, []);

  useEffect(() => {
    async function loadUserDefaults() {
      try {
        const hasSeenTutorial = await NativeStorage.getItem(
          PROPERTY_KEY_TUTORIAL
        );
        if (hasSeenTutorial) {
          setCurrentStep(TutorialSteps.IDLE);
        } else {
          setCurrentStep(TutorialSteps.INITIAL);
        }
      } catch (error) {
        /* empty */
      }

      markTutorialAsSeen();

      try {
        const shouldAlwaysSeeTutorial = await NativeStorage.getItem(
          PROPERTY_KEY_PRESENT_TUTORIAL
        );
        setAlwaysShowTutorial(shouldAlwaysSeeTutorial);
        if (shouldAlwaysSeeTutorial) {
          presentTutorial();
        }
      } catch (error) {
        /* empty */
      }

      setHasLoadedConfigurations(true);
    }

    loadUserDefaults();
  }, [presentTutorial, markTutorialAsSeen]);

  const onFinishTutorial = useCallback(() => {
    setCurrentStep(TutorialSteps.IDLE);
    setCurrentStepIndex(-1);
  }, []);

  const goNextStep = useCallback(() => {
    const index = currentStepIndex + 1;
    if (index < TUTORIAL_QUEUE.length) {
      setCurrentStep(TUTORIAL_QUEUE[index]);
      setCurrentStepIndex(index);
    } else {
      onFinishTutorial();
    }
  }, [currentStepIndex, onFinishTutorial]);

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        goNextStep,
        currentStepIndex,
        onCancel: onFinishTutorial,
        alwaysShowTutorial,
        setAlwaysShowTutorial: onSetAlwaysShowTutorialPreference,
        hasLoadedConfigurations: hasLoadedConfigurations,
      }}>
      {children}
    </TutorialContext.Provider>
  );
};

function useTutorial(): TutorialContextData {
  const context = useContext(TutorialContext);

  if (!context) {
    throw new Error('');
  }
  return context;
}

export { TutorialContext, TutorialProvider, useTutorial };
