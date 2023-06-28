import axios from 'axios';

const api = axios.create({
  baseURL: 'http://homonimos.lavid.ufpb.br:8088/api/v1',
});

export interface VideoData {
  blob: Blob;
}

export async function getVideo(id: string): Promise<Blob> {
  const jsonId = JSON.stringify(id);
  const parseId = JSON.parse(jsonId);

  try {
    const response = await api.get(`/conversion/${parseId.id}`, {
      responseType: 'blob',
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('[LOG: ERRO AO RECEBER VÍDEO]');
  }
}

export async function postVideo(data: VideoData): Promise<string> {
  const form = new FormData();
  form.append('videoConversion', data.blob);
  try {
    const response = await api.post('/conversion', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Accept: 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error('[LOG: ERRO AO ENVIAR VÍDEO]');
  }
}

export default api;
