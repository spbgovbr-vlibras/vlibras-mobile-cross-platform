import axios from 'axios';

import { MetadataParams, ListResponseDictionary } from 'store/ducks/dictionary';

const api = axios.create({
  baseURL: 'https://dicionario2.vlibras.gov.br',
  timeout: 15000
});

export async function getDictionary(
  params: MetadataParams
): Promise<ListResponseDictionary> {
  const response = await api.get('/list', { params });
  return response.data;
}

export default api;
