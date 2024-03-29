/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from 'react';

import { NativeStorage } from '@ionic-native/native-storage';
import { SocialSharing } from '@ionic-native/social-sharing/';

import { ErrorModal, GenerateModal } from 'components';
import { Avatar, TranslationRequestType } from 'constants/types';
import {
  fetchVideoStatus,
  generateVideoTranslate,
  translate,
  VideoStatusResponse,
  VideoTranslationStatus,
} from 'services/translate';

interface PollParams {
  fn: () => Promise<VideoStatusResponse>;
  validate: (status: VideoTranslationStatus) => boolean;
  interval: number;
  maxAttempts: number;
}

interface videoOptions {
  calca?: string;
  camisa?: string;
  cabelo?: string;
  corpo?: string;
  iris?: string;
  olhos?: string;
  sombrancelhas?: string;
  pos?: string;
  logo?: string;
  avatar?: Avatar;
}

interface TranslationContextData {
  textPtBr: string;
  setTextPtBr: (text: string, fromDictionary: boolean) => Promise<string>;
  textGloss: string;
  setTextGloss: (text: string, fromDictionary: boolean) => void;
  recentTranslation: string[];
  generateVideo: (videoData: videoOptions) => void;
}

const TranslationContext = createContext<TranslationContextData>(
  {} as TranslationContextData
);

const poll = ({ fn, validate, interval, maxAttempts }: PollParams) => {
  let attempts = 0;

  const executePoll = async (resolve: any, reject: any) => {
    const result = await fn();
    attempts += 1;

    if (validate(result.status)) {
      return resolve(result);
    }
    if (
      (maxAttempts && attempts === maxAttempts) ||
      result.status === VideoTranslationStatus.FAILED
    ) {
      return reject(new Error('Exceeded max attempts'));
    }
    return setTimeout(executePoll, interval, resolve, reject);
  };

  return new Promise(executePoll);
};

const POLL_INTERVAL = 5000;
const MAX_ATTEMPTS = 50;
const URL_API = 'https://traducao2.vlibras.gov.br/video/download';
const MAX_RECENTS_WORD = 30;
const PROPERTY_KEY = 'recents-dictionary';

const TranslationProvider: React.FC = ({ children }) => {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [loadingVideoGeneration, setVideoGenerationLoading] = useState(false);
  const [loadingTextTranslation, setTextTranslationLoading] = useState(false);
  const [translateRequestType, setTranslateRequestType] = useState(
    TranslationRequestType.VIDEO_SHARE
  );
  const [translationError, setTranslationError] = useState(false);
  const [textPtBr, setTextPtBr] = useState('');
  const [textGloss, setTextGloss] = useState('');
  const [recentTranslation, setRecentTranslation] = useState<string[]>([]);

  useEffect(() => {
    NativeStorage.getItem(PROPERTY_KEY)
      .then(recents => setRecentTranslation(recents))
      .catch(_ => false);
  }, []);

  function handleShareVideo(uuid: string) {
    setTranslateRequestType(TranslationRequestType.VIDEO_SHARE);
    setVideoGenerationLoading(true);
    // Move this function to a service [MA]

    SocialSharing.share('', '', `${URL_API}/${uuid}`)
      .catch(_ => false) // TODO: Enable error modal if fails [MA]
      .finally(() => setVideoGenerationLoading(false));
  }

  async function generateVideo(videoOptions: videoOptions) {
    setTranslateRequestType(TranslationRequestType.VIDEO_SHARE);
    setVideoGenerationLoading(true);
    setTranslationError(false);
    try {
      const gloss = await translate({ text: textPtBr });
      const response = await generateVideoTranslate({ gloss, ...videoOptions });
      const uuid = response.requestUID as string;

      poll({
        fn: () => fetchVideoStatus(uuid),
        validate: (status: VideoTranslationStatus) =>
          status === VideoTranslationStatus.GENERATED,
        interval: POLL_INTERVAL,
        maxAttempts: MAX_ATTEMPTS,
      })
        .then(() => handleShareVideo(uuid))
        .catch(() => {
          setTranslationError(true);
          setErrorModalVisible(true);
        });
    } catch {
      setTranslationError(true);
      setErrorModalVisible(true);
    }
  }

  const handleTextPtBr = useCallback(
    async (text: string, fromDictionary: boolean) => {
      setTranslateRequestType(TranslationRequestType.GLOSS_ONLY);
      setTextTranslationLoading(true);
      setTranslationError(false);
      if (fromDictionary) {
        const recents =
          recentTranslation.length <= MAX_RECENTS_WORD
            ? [text, ...recentTranslation.filter(item => item !== text)]
            : [
                text,
                ...recentTranslation.slice(0, -1).filter(item => item !== text),
              ];
        setRecentTranslation(recents);
        NativeStorage.setItem(PROPERTY_KEY, recents);
      }
      setTextPtBr(text);
      try {
        const gloss = await translate({ text });
        setTextGloss(gloss);
        return gloss;
      } catch {
        setTranslationError(true);
        // don't need
      }

      setTextTranslationLoading(false);
      return text;
    },
    [recentTranslation]
  );

  const handleTextGloss = useCallback(
    async (gloss: string, fromDictionary: boolean) => {
      if (fromDictionary) {
        const recents =
          recentTranslation.length <= MAX_RECENTS_WORD
            ? [gloss, ...recentTranslation.filter(item => item !== gloss)]
            : [
                gloss,
                ...recentTranslation
                  .slice(0, -1)
                  .filter(item => item !== gloss),
              ];
        setRecentTranslation(recents);
        NativeStorage.setItem(PROPERTY_KEY, recents);
      }
      setTextGloss(gloss);
    },
    [recentTranslation]
  );

  const isLoading = loadingVideoGeneration || loadingTextTranslation;
  const setModalVisible = (isVisible: boolean) => {
    switch (translateRequestType) {
      case TranslationRequestType.GLOSS_ONLY: {
        setTextTranslationLoading(isVisible);
        break;
      }
      default: {
        setVideoGenerationLoading(isVisible);
      }
    }
  };

  const onModalPresented = () => {
    if (translationError) {
      setModalVisible(false);
    }
  };

  return (
    <TranslationContext.Provider
      value={{
        textPtBr,
        textGloss,
        setTextPtBr: handleTextPtBr,
        setTextGloss: handleTextGloss,
        recentTranslation,
        generateVideo,
      }}>
      {children}
      <GenerateModal
        visible={isLoading}
        setVisible={setModalVisible}
        translationRequestType={translateRequestType}
        onModalPresented={onModalPresented}
      />

      <ErrorModal
        errorMsg="Erro ao gerar vídeo"
        show={errorModalVisible}
        setShow={setErrorModalVisible}
      />
    </TranslationContext.Provider>
  );
};

function useTranslation(): TranslationContextData {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('');
  }
  return context;
}

export { TranslationContext, TranslationProvider, useTranslation };
