import { NativeStorage } from '@ionic-native/native-storage';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';

export enum CustomizationTutorialSteps {
  IDLE,
  BODY_PARTS,
  COLORS,
  BUTTONS
}

interface CustomizationTutorialContextData {
  currentStep:CustomizationTutorialSteps;
  goNextStep: () => void;
  goPreviousStep: () => void;
  onCancel: () => void;
  currentStepIndex: number;
  presentTutorial: () => void;
}

const CustomizationTutorialContext = createContext<CustomizationTutorialContextData>(
  {} as CustomizationTutorialContextData
);

export const CUSTOMIZATION_TUTORIAL_QUEUE = [
  CustomizationTutorialSteps.BODY_PARTS,
  CustomizationTutorialSteps.COLORS,
  CustomizationTutorialSteps.BUTTONS
];

const CustomizationTutorialProvider: React.FC = ({ children }) => {
  const [currentStep, setCurrentStep] = useState<CustomizationTutorialSteps>(
    CustomizationTutorialSteps.IDLE
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);

  const presentTutorial = useCallback(() => {
    setCurrentStep(CustomizationTutorialSteps.BODY_PARTS);
    setCurrentStepIndex(0);
  }, []);

  const onFinishTutorial = useCallback(() => {
    setCurrentStep(CustomizationTutorialSteps.IDLE);
    setCurrentStepIndex(0);
  }, []);

  const goNextStep = useCallback(() => {
    const index = currentStepIndex + 1;
    if (index < CUSTOMIZATION_TUTORIAL_QUEUE.length) {
      setCurrentStep(CUSTOMIZATION_TUTORIAL_QUEUE[index]);
      setCurrentStepIndex(index);
    } else {
      onFinishTutorial();
    }
  }, [currentStepIndex, onFinishTutorial]);

  const goPreviousStep = useCallback(() => {
    const index = currentStepIndex - 1;
    if (index >= 0) {
      setCurrentStep(CUSTOMIZATION_TUTORIAL_QUEUE[index]);
      setCurrentStepIndex(index);
    }
  }, [currentStepIndex]);

  return (
    <CustomizationTutorialContext.Provider
      value={{
        currentStep,
        goNextStep,
        goPreviousStep,
        currentStepIndex,
        onCancel: onFinishTutorial,
        presentTutorial
      }}>
      {children}
    </CustomizationTutorialContext.Provider>
  );
};

function useCustomizationTutorial(): CustomizationTutorialContextData {
  const context = useContext(CustomizationTutorialContext);

  if (!context) {
    throw new Error('');
  }
  return context;
}

export { CustomizationTutorialContext, CustomizationTutorialProvider, useCustomizationTutorial };
