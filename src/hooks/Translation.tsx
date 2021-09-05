/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react';

import {
  Plugins,
  FilesystemDirectory,
  FilesystemEncoding,
} from '@capacitor/core';
import axios from 'axios';

import { ErrorModal, GenerateModal } from 'components';
import {
  fetchVideoStatus,
  generateVideoTranslate,
  translate,
  VideoStatusResponse,
  VideoTranslationStatus,
} from 'services/translate';
import { convertBlobToBase64 } from 'utils/file';

const { Filesystem, Share } = Plugins;

interface PollParams {
  fn: () => Promise<VideoStatusResponse>;
  validate: (status: VideoTranslationStatus) => boolean;
  interval: number;
  maxAttempts: number;
}

interface TranslationContextData {
  translateText: string;
  setTranslateText: (text: string) => void;
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

const TranslationProvider: React.FC = ({ children }) => {
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [translateText, setTranslateText] = useState('');

  function handleShareVideo(uuid: string) {
    setLoading(true);
    axios({
      url: `https://traducao2.vlibras.gov.br/video/download/${uuid}`,
      method: 'GET',
      responseType: 'blob',
    })
      .then(async response => {
        const name = `${uuid}.mov`;
        const base64 = (await convertBlobToBase64(response.data)) as string;
        const savedFile = await Filesystem.writeFile({
          path: name,
          data: base64,
          directory: FilesystemDirectory.Documents,
          encoding: FilesystemEncoding.UTF8,
        });
        setLoading(false);
        await Share.share({
          title: 'Compartilhar vídeo',
          url: savedFile.uri,
        });
      })
      .catch(error => console.error(error)) // TODO: Enable error modal if fails [MA]
      .finally(() => setLoading(false));
  }

  async function generateVideo() {
    setLoading(true);
    try {
      const gloss = await translate({ text: translateText });
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

  return (
    <TranslationContext.Provider
      value={{ translateText, setTranslateText, generateVideo }}
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
