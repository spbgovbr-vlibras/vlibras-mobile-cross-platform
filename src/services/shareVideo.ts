const BASE_URL = 'https://transcodificador.vlibras.gov.br/api/v1';

export interface VideoData {
  blob: Blob;
}

interface ConversionResponse {
  id: string;
}

export async function getVideo(id: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}/conversion/${id}`);
  if (!response.ok) {
    throw new Error(`getVideo falhou: ${response.status}`);
  }
  return response.blob();
}

export async function postVideo(data: VideoData): Promise<string> {
  const form = new FormData();
  form.append('videoConversion', data.blob, 'video.webm');

  const response = await fetch(`${BASE_URL}/conversion/`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`postVideo falhou: ${response.status} ${text}`);
  }

  const result: ConversionResponse = await response.json();
  return result.id;
}
