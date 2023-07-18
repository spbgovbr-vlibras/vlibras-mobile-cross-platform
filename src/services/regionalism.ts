import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dicionario2.vlibras.gov.br',
});

export async function fetchBundles(siglaRegiao: string): Promise<string> {
  try {
    const response = await api.get(`/bundles?region=${siglaRegiao}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return Promise.resolve('');
  }
}
