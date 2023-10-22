import { useEffect } from 'react';

type BooleanParamsPlayer = 'True' | 'False';
type GetAvatarHandler = (avatarName: string) => void;
type FinishWelcomeHandler = (flag: boolean) => void;
type CounterGlossHandler = (counter: number, glossLength: number) => void;
type OnPlayingStateChangeHandler = (
  isPlaying: boolean,
  isPaused: boolean,
  isPlayingIntervalAnimation: boolean,
  isLoading: boolean,
  isRepeatable: boolean
) => void;
type OnLoadPlayerHandler = () => void;
type UnityEventEmitterEvents =
  | 'onLoadPlayer'
  | 'onPlayingStateChange'
  | 'CounterGloss'
  | 'FinishWelcome'
  | 'GetAvatar';

function toBoolean(flag: BooleanParamsPlayer): boolean {
  return flag === 'True';
}

export class UnityEventEmitter {
  private static instance: UnityEventEmitter;
  private events: { [key in UnityEventEmitterEvents]: unknown[] } = {
    onLoadPlayer: [],
    onPlayingStateChange: [],
    CounterGloss: [],
    FinishWelcome: [],
    GetAvatar: [],
  };

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private constructor() {
    window.GetAvatar = (avatarName: string) => {
      const event = this.events['GetAvatar'];
      if (event) {
        event.forEach((callback) => {
          const castedFunction = callback as GetAvatarHandler;
          castedFunction(avatarName);
        });
      }
    };

    window.FinishWelcome = (flag: boolean) => {
      const event = this.events['FinishWelcome'];
      if (event) {
        event.forEach((callback) => {
          const castedFunction = callback as FinishWelcomeHandler;
          castedFunction(flag);
        });
      }
    };

    window.CounterGloss = (counter: number, glossLength: number) => {
      const event = this.events['CounterGloss'];
      if (event) {
        event.forEach((callback) => {
          const castedFunction = callback as CounterGlossHandler;
          castedFunction(counter, glossLength);
        });
      }
    };

    window.onLoadPlayer = () => {
      const event = this.events['onLoadPlayer'];
      if (event) {
        event.forEach((callback) => {
          const castedFunction = callback as OnLoadPlayerHandler;
          castedFunction();
        });
      }
    };

    window.onPlayingStateChange = (
      isPlaying: BooleanParamsPlayer,
      isPaused: BooleanParamsPlayer,
      isPlayingIntervalAnimation: BooleanParamsPlayer,
      isLoading: BooleanParamsPlayer,
      isRepeatable: BooleanParamsPlayer
    ) => {
      const event = this.events['onPlayingStateChange'];
      if (event) {
        event.forEach((callback) => {
          const castedFunction = callback as OnPlayingStateChangeHandler;
          castedFunction(
            toBoolean(isPlaying),
            toBoolean(isPaused),
            toBoolean(isPlayingIntervalAnimation),
            toBoolean(isLoading),
            toBoolean(isRepeatable)
          );
        });
      }
    };
  }

  public static getInstance(): UnityEventEmitter {
    if (!UnityEventEmitter.instance) {
      UnityEventEmitter.instance = new UnityEventEmitter();
    }

    return UnityEventEmitter.instance;
  }

  subscribe(eventName: UnityEventEmitterEvents, listener: unknown) {
    this.events[eventName].push(listener);
  }

  unsubscribe(eventName: UnityEventEmitterEvents, listener: unknown) {
    if (!this.events[eventName]) return;

    this.events[eventName] = this.events[eventName].filter(
      (l) => l !== listener
    );
  }
}

export function useOnAvatarLoaded(
  handler: GetAvatarHandler,
  dependencies: unknown[]
) {
  useEffect(() => {
    UnityEventEmitter.getInstance().subscribe('GetAvatar', handler);

    return () => {
      UnityEventEmitter.getInstance().unsubscribe('GetAvatar', handler);
    };
  }, dependencies);
}

export function useOnFinisheWelcome(
  handler: FinishWelcomeHandler,
  dependencies: unknown[]
) {
  useEffect(() => {
    UnityEventEmitter.getInstance().subscribe('FinishWelcome', handler);

    return () => {
      UnityEventEmitter.getInstance().unsubscribe('FinishWelcome', handler);
    };
  }, dependencies);
}

export function useOnCounterGloss(
  handler: CounterGlossHandler,
  dependencies: unknown[]
) {
  useEffect(() => {
    UnityEventEmitter.getInstance().subscribe('CounterGloss', handler);

    return () => {
      UnityEventEmitter.getInstance().unsubscribe('CounterGloss', handler);
    };
  }, dependencies);
}

export function useOnPlayingStateChangeHandler(
  handler: OnPlayingStateChangeHandler,
  dependencies: unknown[]
) {
  useEffect(() => {
    UnityEventEmitter.getInstance().subscribe('onPlayingStateChange', handler);

    return () => {
      UnityEventEmitter.getInstance().unsubscribe(
        'onPlayingStateChange',
        handler
      );
    };
  }, dependencies);
}

export function useOnLoadPlayer(
  handler: OnLoadPlayerHandler,
  dependencies: unknown[]
) {
  useEffect(() => {
    UnityEventEmitter.getInstance().subscribe('onLoadPlayer', handler);

    return () => {
      UnityEventEmitter.getInstance().unsubscribe('onLoadPlayer', handler);
    };
  }, dependencies);
}
