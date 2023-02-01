import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { NativeStorage } from '@ionic-native/native-storage';

export enum TutorialSteps {
  IDLE,
  INITIAL,
  TRANSLATION,
  DICTIONARY,
  HISTORY,
  CHANGE_AVATAR,
  MENU,
  LIKED_TRANSLATION,
  SHARE,
}

interface TutorialContextData {
  currentStep: TutorialSteps;
  goNextStep: () => void;
  onCancel: () => void;
  currentStepIndex: number;
  alwaysShowTutorial: boolean;
  setAlwaysShowTutorial: (alwaysShow: boolean) => void;
}

const TutorialContext = createContext<TutorialContextData>(
  {} as TutorialContextData
);

export const TUTORIAL_QUEUE = [
  TutorialSteps.TRANSLATION,
  TutorialSteps.DICTIONARY,
  TutorialSteps.HISTORY,
  TutorialSteps.CHANGE_AVATAR,
  TutorialSteps.MENU,
  TutorialSteps.LIKED_TRANSLATION,
  TutorialSteps.SHARE,
];

const PROPERTY_KEY_TUTORIAL = 'tutorial';
const PROPERTY_KEY_PRESENT_TUTORIAL = 'present-tutorial';

const TutorialProvider: React.FC = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<TutorialSteps>(
    TutorialSteps.INITIAL
  );
  const [alwaysShowTutorial, setAlwaysShowTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const onSetAlwaysShowTutorialPreference = (alwaysShow: boolean) => {
    setAlwaysShowTutorial(alwaysShow);
    NativeStorage.setItem(PROPERTY_KEY_PRESENT_TUTORIAL, alwaysShow);
  };

  const presentTutorial = useCallback(() => {
    setCurrentStep(TutorialSteps.INITIAL);
    setCurrentStepIndex(-1);
  }, []);

  useEffect(() => {
    NativeStorage.getItem(PROPERTY_KEY_TUTORIAL)
      .then(value =>
        value
          ? setCurrentStep(TutorialSteps.IDLE)
          : setCurrentStep(TutorialSteps.INITIAL)
      )
      .catch(_ => false);

    NativeStorage.getItem(PROPERTY_KEY_PRESENT_TUTORIAL)
      .then(value => {
        setAlwaysShowTutorial(value);
        if (value) {
          presentTutorial();
        }
      })
      .catch(_ => false);
  }, [presentTutorial]);

  const onFinishTutorial = useCallback(() => {
    setCurrentStep(TutorialSteps.IDLE);
    setCurrentStepIndex(-1);
  }, []);

  const goNextStep = useCallback(() => {
    NativeStorage.setItem(PROPERTY_KEY_TUTORIAL, true);

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
