import axios from 'axios';
import { Capacitor } from '@capacitor/core';

import {
  getVideoCapacitorHttp,
  postVideoCapacitorHttp,
} from './transcoderCapacitorHttp';
import { TRANSCODER_ROUTES, TranscoderHttpError } from './transcoderRoutes';

export { TRANSCODER_ROUTES, TranscoderHttpError };

const DEV_PROXY_BASE = '/transcodificador-api/';
const REQUEST_TIMEOUT_MS = 180_000;

function resolveTranscoderBaseURL(): string {
  if (process.env.NODE_ENV !== 'development' || typeof window === 'undefined') {
    return TRANSCODER_ROUTES.base;
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return DEV_PROXY_BASE;
  }
  return TRANSCODER_ROUTES.base;
}

const api = axios.create({
  baseURL: resolveTranscoderBaseURL(),
  timeout: REQUEST_TIMEOUT_MS,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
});

export interface VideoData {
  blob: Blob;
}

interface ConversionCreatedResponse {
  id: string;
}

function uploadFilename(blob: Blob): string {
  if (blob.type.includes('webm')) return 'video.webm';
  if (blob.type.includes('mp4')) return 'video.mp4';
  return 'video.webm';
}

function appendVideoConversionField(form: FormData, blob: Blob): void {
  const name = uploadFilename(blob);
  const type = blob.type || 'video/webm';
  if (typeof File !== 'undefined') {
    form.append('videoConversion', new File([blob], name, { type }), name);
    return;
  }
  form.append('videoConversion', blob, name);
}

function parseConversionId(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'id' in body) {
    const id = (body as ConversionCreatedResponse).id;
    if (typeof id === 'string' && id.length > 0) return id;
  }
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (!trimmed) throw new Error('Resposta vazia do transcodificador');
    if (trimmed.startsWith('{')) {
      const parsed = JSON.parse(trimmed) as ConversionCreatedResponse;
      if (typeof parsed.id === 'string' && parsed.id.length > 0) return parsed.id;
    }
    return trimmed;
  }
  throw new Error('Resposta inválida do transcodificador');
}

/** Rejeita WebM corrompido antes do upload (evita HTTP 500 opaco no servidor). */
async function assertValidWebm(blob: Blob): Promise<void> {
  if (blob.size === 0) return;
  const head = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  const ebml =
    head.length >= 4 &&
    head[0] === 0x1a &&
    head[1] === 0x45 &&
    head[2] === 0xdf &&
    head[3] === 0xa3;
  if (!ebml) {
    throw new TranscoderHttpError(0, 'gravação WebM inválida (sem cabeçalho EBML)');
  }
}

export async function isConvertedMp4(blob: Blob): Promise<boolean> {
  if (blob.size < 12) return false;
  const head = new Uint8Array(await blob.slice(0, 12).arrayBuffer());
  return (
    head[4] === 0x66 &&
    head[5] === 0x74 &&
    head[6] === 0x79 &&
    head[7] === 0x70
  );
}

export type ConversionResult =
  | { kind: 'ready'; blob: Blob }
  | { kind: 'pending'; status: string }
  | { kind: 'failed'; status: string };

const FAILURE_STATUS = /ERRO|ERROR|FALHA|FAIL/i;

async function readStatus(blob: Blob): Promise<string | null> {
  if (blob.size === 0 || blob.size > 2048) return null;
  try {
    const text = new TextDecoder().decode(await blob.arrayBuffer()).trim();
    if (!text.startsWith('{')) return null;
    const parsed = JSON.parse(text) as { status?: unknown };
    return typeof parsed.status === 'string' ? parsed.status : null;
  } catch (_) {
    return null;
  }
}

export async function getVideo(id: string): Promise<Blob> {
  if (Capacitor.isNativePlatform()) {
    return getVideoCapacitorHttp(id);
  }

  const conversionId =
    typeof id === 'string' && id.trim().startsWith('{')
      ? (JSON.parse(id) as { id: string }).id
      : id;

  const response = await api.get(`/conversion/${conversionId}`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function getConversion(id: string): Promise<ConversionResult> {
  const blob = await getVideo(id);
  if (await isConvertedMp4(blob)) return { kind: 'ready', blob };

  const status = await readStatus(blob);
  if (status && FAILURE_STATUS.test(status)) return { kind: 'failed', status };
  return { kind: 'pending', status: status ?? 'sem status' };
}

export async function postVideo(video: VideoData): Promise<string> {
  if (Capacitor.isNativePlatform()) {
    await assertValidWebm(video.blob);
    return postVideoCapacitorHttp(video.blob);
  }

  const form = new FormData();
  appendVideoConversionField(form, video.blob);

  const response = await api.post<ConversionCreatedResponse | string>(
    '/conversion/',
    form,
    {
      headers: { Accept: 'application/json' },
      transformRequest: [(data) => data],
    }
  );

  return parseConversionId(response.data);
}

export default api;
