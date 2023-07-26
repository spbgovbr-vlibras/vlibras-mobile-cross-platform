import axios from 'axios';

import { PlayerKeys } from 'constants/player';

import UnityService, { DICTIONAY_URL } from './unity';

let newDictionary = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';
let regionAbbr = ''

const api = axios.create({
  baseURL: 'https://dicionario2.vlibras.gov.br',
});

export async function fetchBundles(siglaRegiao: string): Promise<string> {
    const response = await api.get(`/bundles?region=${siglaRegiao}`);
    return response.data;
}

export function setRegion(region: string) {
   
  console.log('tô no set region')
  if (region !== 'BR') {
    newDictionary = ''
    regionAbbr = region
    newDictionary = `${DICTIONAY_URL}${regionAbbr}/`
  }
  else if (region === 'BR') {
    newDictionary = ''
    newDictionary = DICTIONAY_URL
  }

  UnityService.getService().send(
    PlayerKeys.PLAYER_MANAGER,
    PlayerKeys.SET_BASE_URL,
    newDictionary
  );
}
