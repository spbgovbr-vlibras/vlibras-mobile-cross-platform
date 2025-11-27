import axios from 'axios';

import { Tag, TagSignsResponse } from 'models/dictionary';

const api = axios.create({
  baseURL: 'https://repositorio-dth.vlibras.lavid.ufpb.br/api',
  timeout: 15000
});

export async function getTags(): Promise<Tag[]> {
  const response = await api.get<Tag[]>('/tags');
  return response.data;
}

export async function getSignsByTag(tag: string): Promise<TagSignsResponse> {
  const response = await api.get<TagSignsResponse>('/tagsigns', {
    params: { tag }
  });
  return response.data;
}

export default api;
