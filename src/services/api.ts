import axios from 'axios';

const api = axios.create({
  baseURL: 'https://repository-dth.vlibras.gov.br',
});
export default api;
