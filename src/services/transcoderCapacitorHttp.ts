import { CapacitorHttp, HttpResponse } from '@capacitor/core';

import { TRANSCODER_ROUTES, TranscoderHttpError } from './transcoderRoutes';

const TIMEOUT_MS = 180_000;

function randomMultipartBoundary(): string {
  const arr = new Uint8Array(12);
  crypto.getRandomValues(arr);
  const hex = Array.from(arr)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `----VLibrasApp${hex}`;
}

function uploadFilename(blob: Blob): string {
  if (blob.type.includes('webm')) return 'video.webm';
  if (blob.type.includes('mp4')) return 'video.mp4';
  return 'video.webm';
}

async function blobToBase64Raw(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const raw = reader.result as string;
      const comma = raw.indexOf(',');
      resolve(comma >= 0 ? raw.slice(comma + 1) : raw);
    };
    reader.onerror = () => reject(new Error('FileReader falhou'));
    reader.readAsDataURL(blob);
  });
}

function base64ToBlob(base64: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes]);
}

function responseText(response: HttpResponse): string {
  const { data } = response;
  if (typeof data === 'string') return data;
  if (data === null || data === undefined) return '';
  return JSON.stringify(data);
}

function parseConversionIdFromText(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Resposta vazia do transcodificador');
  if (trimmed.startsWith('{')) {
    const parsed = JSON.parse(trimmed) as { id?: string };
    if (typeof parsed.id === 'string' && parsed.id.length > 0) return parsed.id;
    throw new Error('Resposta inválida do transcodificador');
  }
  return trimmed;
}

/** POST via OkHttp nativo — evita "Failed to fetch" do WebView. */
export async function postVideoCapacitorHttp(
  blob: Blob,
  attempt = 1
): Promise<string> {
  const filename = uploadFilename(blob);
  const contentType = blob.type || 'video/webm';
  const boundary = randomMultipartBoundary();
  const base64 = await blobToBase64Raw(blob);

  console.log(
    '[VLibras Share] POST CapacitorHttp formData',
    TRANSCODER_ROUTES.postConversion,
    'bytes:',
    blob.size,
    'tentativa:',
    attempt
  );

  try {
    const response = await CapacitorHttp.request({
      url: TRANSCODER_ROUTES.postConversion,
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      dataType: 'formData',
      data: [
        {
          type: 'base64File',
          key: 'videoConversion',
          fileName: filename,
          contentType,
          value: base64,
        },
      ],
      connectTimeout: TIMEOUT_MS,
      readTimeout: TIMEOUT_MS,
      responseType: 'text',
    });

    const text = responseText(response);
    if (response.status < 200 || response.status >= 300) {
      console.error(
        '[VLibras Share] POST CapacitorHttp:',
        response.status,
        text.slice(0, 400)
      );
      throw new TranscoderHttpError(response.status, text.slice(0, 300));
    }

    return parseConversionIdFromText(text);
  } catch (error) {
    if (error instanceof TranscoderHttpError) {
      const retriable = attempt < 2 && (error.status >= 500 || error.status === 0);
      if (retriable) {
        await new Promise((r) => window.setTimeout(r, 800));
        return postVideoCapacitorHttp(blob, attempt + 1);
      }
      throw error;
    }
    if (error instanceof Error) {
      throw new TranscoderHttpError(0, error.message.slice(0, 160));
    }
    throw error;
  }
}

export async function getVideoCapacitorHttp(id: string): Promise<Blob> {
  const conversionId =
    typeof id === 'string' && id.trim().startsWith('{')
      ? (JSON.parse(id) as { id: string }).id
      : id;

  const response = await CapacitorHttp.request({
    url: TRANSCODER_ROUTES.getConversion(conversionId),
    method: 'GET',
    headers: { Accept: '*/*' },
    connectTimeout: TIMEOUT_MS,
    readTimeout: TIMEOUT_MS,
    responseType: 'blob',
  });

  if (response.status < 200 || response.status >= 300) {
    const snippet = responseText(response).slice(0, 300);
    throw new TranscoderHttpError(response.status, snippet);
  }

  const data = response.data;
  if (typeof data === 'string') {
    return base64ToBlob(data);
  }
  throw new TranscoderHttpError(0, 'resposta GET sem blob');
}
