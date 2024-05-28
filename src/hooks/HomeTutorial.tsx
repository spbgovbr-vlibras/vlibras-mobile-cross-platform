import { NativeStorage } from '@ionic-native/native-storage';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

export enum HomeTutorialSteps {
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

interface HomeTutorialContextData {
  currentStep: HomeTutorialSteps;
  goNextStep: () => void;
  goPreviousStep: () => void;
  onCancel: () => void;
  currentStepIndex: number;
  hasLoadedConfigurations: boolean;
}

const HomeTutorialContext = createContext<HomeTutorialContextData>(
  {} as HomeTutorialContextData
);

export const HOME_TUTORIAL_QUEUE = [
  HomeTutorialSteps.TRANSLATION,
  HomeTutorialSteps.DICTIONARY,
  HomeTutorialSteps.HISTORY,
  HomeTutorialSteps.TUTORIAL,
  HomeTutorialSteps.CHANGE_AVATAR,
  HomeTutorialSteps.MENU,
  HomeTutorialSteps.CLOSE,
  HomeTutorialSteps.LIKED_TRANSLATION,
  HomeTutorialSteps.SHARE,
  HomeTutorialSteps.SUBTITLE,
  HomeTutorialSteps.REPEAT,
  HomeTutorialSteps.PLAYBACK_SPEED,
];

const PROPERTY_KEY_TUTORIAL = 'tutorial';

const HomeTutorialProvider: React.FC = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<HomeTutorialSteps>(
    HomeTutorialSteps.INITIAL
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [hasLoadedConfigurations, setHasLoadedConfigurations] = useState(false);

  const presentTutorial = useCallback(() => {
    setCurrentStep(HomeTutorialSteps.INITIAL);
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
          setCurrentStep(HomeTutorialSteps.IDLE);
        } else {
          setCurrentStep(HomeTutorialSteps.INITIAL);
        }
      } catch (error) {
        /* empty */
      }

      markTutorialAsSeen();
      setHasLoadedConfigurations(true);
    }

    loadUserDefaults();
  }, [presentTutorial, markTutorialAsSeen]);

  const onFinishTutorial = useCallback(() => {
    setCurrentStep(HomeTutorialSteps.IDLE);
    setCurrentStepIndex(-1);
  }, []);

  const goNextStep = useCallback(() => {
    const index = currentStepIndex + 1;
    if (index < HOME_TUTORIAL_QUEUE.length) {
      setCurrentStep(HOME_TUTORIAL_QUEUE[index]);
      setCurrentStepIndex(index);
    } else {
      onFinishTutorial();
    }
  }, [currentStepIndex, onFinishTutorial]);

  const goPreviousStep = useCallback(() => {
    const index = currentStepIndex - 1;
    if (index >= 0) {
      setCurrentStep(HOME_TUTORIAL_QUEUE[index]);
      setCurrentStepIndex(index);
    }
  }, [currentStepIndex]);

  return (
    <HomeTutorialContext.Provider
      value={{
        currentStep,
        goNextStep,
        goPreviousStep,
        currentStepIndex,
        onCancel: onFinishTutorial,
        hasLoadedConfigurations: hasLoadedConfigurations,
      }}>
      {children}
    </HomeTutorialContext.Provider>
  );
};

function useHomeTutorial(): HomeTutorialContextData {
  const context = useContext(HomeTutorialContext);

  if (!context) {
    throw new Error('');
  }
  return context;
}

export { HomeTutorialContext, HomeTutorialProvider, useHomeTutorial };
