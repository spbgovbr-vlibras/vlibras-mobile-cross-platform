import { UnityContent } from 'react-unity-webgl';

import { PlayerKeys } from 'constants/player';
import { UnityEventEmitter } from 'hooks/unityHooks';

const DICTIONAY_URL = 'https://dicionario2.vlibras.gov.br/2018.3.1/WEBGL/';

export default class UnityService {
  private readonly unityContent: UnityContent;

  private static playerInstance: UnityService;
  private static editorInstance: UnityService;

  private isReady: boolean;

  /** Evita SET_URL duplicado; `onLoadPlayer` pode disparar antes de `Home.load()` inscrever o listener. */
  private unityBridgeInitialized = false;

  private constructor() {
    this.unityContent = new UnityContent(
      'final/Build/06-10-2025 [SEM TRANSPPARENCIA].json',
      'final/Build/UnityLoader.js',
      {
        adjustOnWindowResize: true,
      }
    );
    this.isReady = false;
  }

  static allInstances(): UnityService[] {
    if (!UnityService.playerInstance) {
      UnityService.playerInstance = new UnityService();
    }

    if (!UnityService.editorInstance) {
      UnityService.editorInstance = new UnityService();
    }

    return [UnityService.playerInstance, UnityService.editorInstance];
  }

  static getPlayerInstance(): UnityService {
    if (!UnityService.playerInstance) {
      UnityService.playerInstance = new UnityService();
    }
    return UnityService.playerInstance;
  }

  static getEditorInstance(): UnityService {
    if (!UnityService.editorInstance) {
      UnityService.editorInstance = new UnityService();
    }
    return UnityService.editorInstance;
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

  setPlayerRegion(regionAbreviation: string) {
    this.setBaseURL(regionAbreviation);
  }

  /**
   * Configuração pós-carregamento do WebGL (SET_URL + base do dicionário).
   * Idempotente — deve ser chamada tanto pelo `onLoadPlayer` do Unity quanto
   * quando `progress === 1` no Player, para não depender da ordem dos eventos.
   */
  initializeUnityBridge(regionAbreviation = ''): void {
    if (!this.unityBridgeInitialized) {
      try {
        this.unityContent.send(PlayerKeys.PLAYER_MANAGER, PlayerKeys.SET_URL, '');
      } catch {
        /* Instância ainda não aceita mensagens em alguns frames */
      }
      this.unityBridgeInitialized = true;
    }
    try {
      this.setBaseURL(regionAbreviation);
    } catch {
      /* ignore */
    }
    this.isReady = true;
  }

  load(regionAbreviation = ''): void {
    if (this.unityBridgeInitialized) {
      this.initializeUnityBridge(regionAbreviation);
      return;
    }

    let onLoadPlayer: () => void;
    // eslint-disable-next-line prefer-const
    onLoadPlayer = () => {
      this.initializeUnityBridge(regionAbreviation);
      UnityEventEmitter.getInstance().unsubscribe('onLoadPlayer', onLoadPlayer);
    };
    UnityEventEmitter.getInstance().subscribe('onLoadPlayer', onLoadPlayer);
  }

  private setBaseURL(regionAbreviation: string) {
    let newDictionary = DICTIONAY_URL;
    if (regionAbreviation !== '' && regionAbreviation !== 'BR') {
      newDictionary = `${DICTIONAY_URL}${regionAbreviation}/`;
    }

    this.send(
      PlayerKeys.PLAYER_MANAGER,
      PlayerKeys.SET_BASE_URL,
      newDictionary
    );
  }
}

export { DICTIONAY_URL };
