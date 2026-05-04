import axios from 'axios';

import { Avatar } from 'constants/types';
import { accentuatePortugueseText } from 'utils/accentuatePtBr';

export enum VideoTranslationStatus {
  QUEUED = 'queued',
  PROCESSING = 'processing',
  GENERATING = 'generating',
  GENERATED = 'generated',
  FAILED = 'failed',
  EXPIRED = 'expired',
  DOWNLOADING = 'downloading',
  DOWNLOAD_FAILED = 'download_failed',
  READY = 'ready',
}

export interface VideoStatusResponse {
  status: VideoTranslationStatus;
  size: number;
}

interface TranslateData {
  text: string;
}

export interface SentimentSentence {
  traducao: string;
  sentimento: string;
}

export interface TranslateSentimentResponse {
  traducao: string;
  sentimentoGeral: string;
  sentimentoPorSentenca: SentimentSentence[];
}

interface TranslateVideoData {
  gloss: string;
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

interface TranslationVideoResponse {
  requestUID?: string;
  error?: string;
}

const defaultTranslateData = {
  avatar: 'icaro',
  caption: 'on',
  pos: 'center',
};

const api = axios.create({
  baseURL: 'https://traducao2.vlibras.gov.br',
  timeout: 15000,
});

export async function fetchVideoStatus(
  id: string
): Promise<VideoStatusResponse> {
  const response = await api.get(`/video/status/${id}`);
  return response.data;
}

/**
 * This function may throw an error if the value is not a string
 * @param value The value to be cast to string
 * @throws {Error} Throws an error if the received value cant be parsed to string.
 */
export async function translate(data: TranslateData): Promise<string> {
  const textForApi = accentuatePortugueseText(data.text);
  const response = await api.post('/translate', { text: textForApi });
  const payload = response.data as unknown;
  // API may return a raw string OR a structured object.
  // Converting object directly results in "[object Object]" (avatar fingerspells "OBJECT").
  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (typeof obj.traducao === 'string') return obj.traducao;
    if (typeof obj.gloss === 'string') return obj.gloss;
    if (typeof obj.translation === 'string') return obj.translation;
  }
  throw Error('Could not parse received gloss data.');
}

export async function translateWithSentiment(
  data: TranslateData,
): Promise<TranslateSentimentResponse> {
  const textForApi = accentuatePortugueseText(data.text);
  const response = await api.post('/translatesentiment', { text: textForApi });
  return response.data;
}

export async function generateVideoTranslate(
  data: TranslateVideoData
): Promise<TranslationVideoResponse> {
  const response = await api.post('/video', {
    ...defaultTranslateData,
    ...data,
  });
  return response.data;
}

export default api;
