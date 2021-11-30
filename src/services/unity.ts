import { UnityContent } from 'react-unity-webgl';

import { PlayerKeys } from 'constants/player';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';

export default class UnityService {
  private readonly unityContent: UnityContent;

  private static service: UnityService;

  private isReady: boolean;

  private constructor() {
    this.unityContent = new UnityContent(
      'final/Build/final.json',
      'final/Build/UnityLoader.js',
      {
        adjustOnWindowResize: true,
      },
    );
    this.isReady = false;
  }

  static getService(): UnityService {
    if (!UnityService.service) {
      UnityService.service = new UnityService();
    }
    return UnityService.service;
  }

  getUnity(): UnityContent {
    return this.unityContent;
  }

  getIsReady(): boolean {
    return this.isReady;
  }

  send(fn: PlayerKeys, action: PlayerKeys, params?: number | string): void {
    this.unityContent.send(fn, action, params);
  }

  load(): void {
    window.onLoadPlayer = () => {
      this.unityContent.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.INIT_RANDOM_ANIMATION,
      );
      this.unityContent.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.SET_URL, '');
      this.unityContent.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.SET_BASE_URL,
        DICTIONAY_URL,
      );
      this.isReady = true;
    };
  }
}
