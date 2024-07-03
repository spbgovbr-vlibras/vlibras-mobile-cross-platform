import axios from 'axios';

const api = axios.create({
  baseURL: 'https://transcodificador-dth.vlibras.gov.br/api/v1/',
});

export interface VideoData {
  blob: Blob;
}

export async function getVideo(id: string): Promise<Blob> {
  const jsonId = JSON.stringify(id);
  const parseId = JSON.parse(jsonId);

  const response = await api.get(`/conversion/${parseId.id}`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function postVideo(data: VideoData): Promise<string> {
  const form = new FormData();
  form.append('videoConversion', data.blob);
  const response = await api.post('/conversion', form, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Accept: 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
  return response.data;
}

export default api;
