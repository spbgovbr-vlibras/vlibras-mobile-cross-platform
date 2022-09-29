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
  presentTutorial: boolean;
  setPresentTutorial: (presentTutorial: boolean) => void;
}

const TutorialContext = createContext<TutorialContextData>(
  {} as TutorialContextData,
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
    TutorialSteps.INITIAL,
  );
  const [presentTutorial, setPresentTutorial] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  useEffect(() => {
    NativeStorage.getItem(PROPERTY_KEY_TUTORIAL)
      .then(value =>
        value
          ? setCurrentStep(TutorialSteps.IDLE)
          : setCurrentStep(TutorialSteps.INITIAL),
      )
      .catch(_ => false);

      NativeStorage.getItem(PROPERTY_KEY_PRESENT_TUTORIAL)
      .then(value => onSetPresentTutorial(value))
      .catch(_ => false);
  }, []);

  const onCancel = useCallback(() => {
    NativeStorage.setItem(PROPERTY_KEY_TUTORIAL, true);
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
      onCancel();
    }
  }, [currentStepIndex, onCancel]);

  const onSetPresentTutorial = useCallback((value: boolean) => {
    if (value) {
      setCurrentStep(TutorialSteps.INITIAL)
      setCurrentStepIndex(-1);
    }
    setPresentTutorial(value);
    NativeStorage.setItem(PROPERTY_KEY_PRESENT_TUTORIAL, value);
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        currentStep,
        goNextStep,
        currentStepIndex,
        onCancel,
        presentTutorial,
        setPresentTutorial: onSetPresentTutorial,
      }}
    >
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
