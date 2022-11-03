import axios from 'axios';

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
  avatar?: string;
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

export async function translate(data: TranslateData): Promise<string> {
  const response = await api.post('/translate', data);
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
