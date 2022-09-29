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

interface TranslationContextData {
  textPtBr: string;
  setTextPtBr: (text: string, fromDictionary: boolean) => Promise<string>;
  textGloss: string;
  setTextGloss: (text: string, fromDictionary: boolean) => void;
  recentTranslation: string[];
  generateVideo: () => void;
}

const TranslationContext = createContext<TranslationContextData>(
  {} as TranslationContextData,
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
  const [loading, setLoading] = useState(false);
  const [textPtBr, setTextPtBr] = useState('');
  const [textGloss, setTextGloss] = useState('');
  const [recentTranslation, setRecentTranslation] = useState<string[]>([]);

  useEffect(() => {
    NativeStorage.getItem(PROPERTY_KEY)
      .then(recents => setRecentTranslation(recents))
      .catch(_ => false);
  }, []);

  function handleShareVideo(uuid: string) {
    setLoading(true);
    // Move this function to a service [MA]

    SocialSharing.share('', '', `${URL_API}/${uuid}`)
      .catch(_ => false) // TODO: Enable error modal if fails [MA]
      .finally(() => setLoading(false));
  }

  async function generateVideo() {
    setLoading(true);
    try {
      const gloss = await translate({ text: textPtBr });
      const response = await generateVideoTranslate({ gloss });
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
          setLoading(false);
          setErrorModalVisible(true);
        });
    } catch {
      setLoading(false);
      setErrorModalVisible(true);
    }
  }

  const handleTextPtBr = useCallback(
    async (text: string, fromDictionary: boolean) => {
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
        // don't need
      }
      return text;
    },
    [recentTranslation],
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
    [recentTranslation],
  );

  return (
    <TranslationContext.Provider
      value={{
        textPtBr,
        textGloss,
        setTextPtBr: handleTextPtBr,
        setTextGloss: handleTextGloss,
        recentTranslation,
        generateVideo,
      }}
    >
      {children}
      <GenerateModal visible={loading} setVisible={setLoading} />
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
