import { UnityContent } from 'react-unity-webgl';

import { PlayerKeys } from 'constants/player';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';

export default class UnityService {
  private readonly unityContent: UnityContent;

  private static service: UnityService;

  private constructor() {
    this.unityContent = new UnityContent(
      'Build/Build Final.json',
      'Build/UnityLoader.js',
      {
        adjustOnWindowResize: true,
      },
    );
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
    };
  }
}
