import axios from 'axios';

import { MetaDataParams } from 'store/ducks/dictionary';

const api = axios.create({
  baseURL: 'https://dicionario2-dth.vlibras.gov.br/api',
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

export async function getDictionary(params: MetaDataParams): Promise<any> {
  try {
    const response = await api.get('/list', { params });
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default api;
