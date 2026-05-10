/* eslint-disable @typescript-eslint/no-explicit-any */

import { NativeStorage } from '@ionic-native/native-storage';
import { SocialSharing } from '@ionic-native/social-sharing/';
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';

import { ErrorModal, GenerateModal } from 'components';
import { Avatar, TranslationRequestType } from 'constants/types';
import {
  fetchVideoStatus,
  generateVideoTranslate,
  translate,
  translateWithSentiment,
  SentimentSentence,
  VideoStatusResponse,
  VideoTranslationStatus,
} from 'services/translate';
import { delay } from 'utils/delay';
import { PlayerKeys } from 'constants/player';
import UnityService from 'services/unity';

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
  setTextPtBr: (
    text: string,
    fromDictionary: boolean,
    showLoading?: boolean
  ) => Promise<string>;
  textGloss: string;
  setTextGloss: (text: string, fromDictionary: boolean) => void;
  recentTranslation: string[];
  generateVideo: (videoData: videoOptions) => void;
  sentimentAnalysis: SentimentSentence[];
  selectedEmotion: string;
  setSelectedEmotion: (emotion: string) => void;
  dictMiniPlayer: { active: boolean; gloss: string; loading: boolean; requestId: number };
  setDictMiniPlayer: (
    active: boolean,
    gloss?: string,
    options?: { loading?: boolean }
  ) => void;
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
  const [isLoading, setIsLoading] = useState(false);
  const [translateRequestType, setTranslateRequestType] = useState(
    TranslationRequestType.VIDEO_SHARE
  );
  const [translationGlossError, setTranslationGlossError] = useState(false);
  const [textPtBr, setTextPtBr] = useState('');
  const [textGloss, setTextGloss] = useState('');
  const [recentTranslation, setRecentTranslation] = useState<string[]>([]);
  const [sentimentAnalysis, setSentimentAnalysis] = useState<SentimentSentence[]>([]);
  // COMENTADO PARA DEPLOY - Valor padrão mudado de 'Automático' para 'Neutra'
  const [selectedEmotion, setSelectedEmotion] = useState('Neutra');
  const [dictMiniPlayer, setDictMiniPlayerState] = useState({
    active: false,
    gloss: '',
    loading: false,
    requestId: 0,
  });
  const translateRequestIdRef = useRef(0);
  const dictMiniRequestIdRef = useRef(0);

  function setDictMiniPlayer(
    active: boolean,
    gloss?: string,
    options?: { loading?: boolean }
  ) {
    const nextRequestId = active ? ++dictMiniRequestIdRef.current : 0;
    setDictMiniPlayerState({
      active,
      gloss: active && gloss ? gloss : '',
      loading: !!(active && options?.loading),
      requestId: nextRequestId,
    });
  }

  useEffect(() => {
    NativeStorage.getItem(PROPERTY_KEY)
      .then((recents) => setRecentTranslation(recents))
      .catch((_) => false);
  }, []);

  function handleShareVideo(uuid: string) {
    setTranslateRequestType(TranslationRequestType.VIDEO_SHARE);
    setIsLoading(true);
    // Move this function to a service [MA]

    SocialSharing.share('', '', `${URL_API}/${uuid}`)
      .catch((_) => false) // TODO: Enable error modal if fails [MA]
      .finally(() => setIsLoading(false));
  }

  const setModalVisible = useCallback(
    (isVisible: boolean) => {
      setIsLoading(isVisible);
    },
    [setIsLoading]
  );

  async function generateVideo(videoOptions: videoOptions) {
    setTranslateRequestType(TranslationRequestType.VIDEO_SHARE);
    setIsLoading(true);
    try {
      const { traducao, sentimentoPorSentenca } = await translateWithSentiment({ text: textPtBr });
      const sentences = Array.isArray(sentimentoPorSentenca)
        ? sentimentoPorSentenca
        : [];
      setSentimentAnalysis(sentences);
      const gloss = traducao;
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
        .catch(async () => {
          await delay(500);
          setIsLoading(false);
          setErrorModalVisible(true);
        });
    } catch {
      await delay(500);
      setIsLoading(false);
      setErrorModalVisible(true);
    }
  }

  const handleTextPtBr = useCallback(
    async (text: string, fromDictionary: boolean, showLoading = true) => {
      let translation: string = text;
      const requestId = ++translateRequestIdRef.current;
      setTranslateRequestType(TranslationRequestType.GLOSS_ONLY);
      if (showLoading) {
        setModalVisible(true);
      }
      setTranslationGlossError(false);
      // Clear previous sentiment to avoid stale data affecting the next play.
      setSentimentAnalysis([]);
      if (fromDictionary) {
        const recents =
          recentTranslation.length <= MAX_RECENTS_WORD
            ? [text, ...recentTranslation.filter((item) => item !== text)]
            : [
              text,
              ...recentTranslation
                .slice(0, -1)
                .filter((item) => item !== text),
            ];
        setRecentTranslation(recents);
        NativeStorage.setItem(PROPERTY_KEY, recents);
      }
      setTextPtBr(text);

      try {
        // COMENTADO PARA DEPLOY - Lógica de modo automático removida temporariamente
        // In Automatic emotion mode, we must wait for sentiment to ensure expressions are applied
        // reliably (especially for short phrases) and that word ranges match the played gloss.
        // if (selectedEmotion === 'Automático') {
        //   const { traducao, sentimentoPorSentenca } = await translateWithSentiment({ text });
        //   const sentences = Array.isArray(sentimentoPorSentenca)
        //     ? sentimentoPorSentenca
        //     : [];
        //   if (translateRequestIdRef.current === requestId) {
        //     setSentimentAnalysis(sentences);
        //   }
        //   const gloss = traducao;
        //   setTextGloss(gloss);
        //   translation = gloss;
        //   if (showLoading) {
        //     setModalVisible(false);
        //   }
        // } else {
          // Fast path for non-automatic emotion mode: translate gloss only (lighter).
          const gloss = (await translate({ text })).toString();
          setTextGloss(gloss);
          translation = gloss;
          if (showLoading) {
            setModalVisible(false);
          }
        // }
      } catch {
        // Fallback to original behavior if /translate fails.
        try {
          const { traducao, sentimentoPorSentenca } = await translateWithSentiment({ text });
          const sentences = Array.isArray(sentimentoPorSentenca)
            ? sentimentoPorSentenca
            : [];
          if (translateRequestIdRef.current === requestId) {
            setSentimentAnalysis(sentences);
          }
          const gloss = traducao;
          setTextGloss(gloss);
          translation = gloss;
          if (showLoading) {
            setModalVisible(false);
          }
        } catch {
          setTextGloss(text);
          await delay(500);
          if (showLoading) {
            setIsLoading(false);
          }
          if (showLoading) {
            setTranslationGlossError(true);
          }
          await delay(1500);
          translation = text;
        }
      }

      return translation;
    },
    [recentTranslation, selectedEmotion, setModalVisible]
  );

  const handleTextGloss = useCallback(
    async (gloss: string, fromDictionary: boolean) => {
      if (fromDictionary) {
        const recents =
          recentTranslation.length <= MAX_RECENTS_WORD
            ? [gloss, ...recentTranslation.filter((item) => item !== gloss)]
            : [
              gloss,
              ...recentTranslation
                .slice(0, -1)
                .filter((item) => item !== gloss),
            ];
        setRecentTranslation(recents);
        NativeStorage.setItem(PROPERTY_KEY, recents);
        // Words from the dictionary have no PT BR text, only gloss. [TF]
        setTextPtBr(gloss);
      }
      setTextGloss(gloss);
    },
    [recentTranslation]
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
        sentimentAnalysis,
        selectedEmotion,
        setSelectedEmotion,
        dictMiniPlayer,
        setDictMiniPlayer,
      }}>
      {children}
      <GenerateModal
        visible={isLoading}
        setVisible={setIsLoading}
        translationRequestType={translateRequestType}
      />

      <ErrorModal
        errorMsg="Erro ao gerar vídeo"
        show={errorModalVisible}
        setShow={setErrorModalVisible}
      />
      <ErrorModal
        errorMsg="Erro ao traduzir. Poderemos usar datilologia."
        show={translationGlossError}
        setShow={setTranslationGlossError}
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
