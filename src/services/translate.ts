import axios from 'axios';

import { Avatar } from 'constants/types';

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
  const response = await api.post('/translate', data);
  try {
    return String(response.data);
  } catch(error: unknown) {
    throw Error('Could parse received gloss data to string.')
  }
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
