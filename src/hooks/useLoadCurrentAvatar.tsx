import { useCallback, useEffect, useState } from 'react';

import { PlayerKeys } from 'constants/player';
import { Avatar } from 'constants/types';
import UnityService from 'services/unity';

import { useOnAvatarLoaded } from './unityHooks';

export const useLoadCurrentAvatar = (
  initialAvatar: Avatar,
  unityService: UnityService,
  nextAvatar: Avatar,
  onAvatarFirstLoaded?: () => void
) => {
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const loadCurrentAvatar = useCallback(() => {
    let innerTimeout: NodeJS.Timeout | undefined;

    const timeout = setTimeout(() => {
      unityService.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.CHANGE_AVATAR,
        initialAvatar
      );
      setIsFirstLoaded(true);

      innerTimeout = setTimeout(() => {
        if (onAvatarFirstLoaded) {
          onAvatarFirstLoaded();
        }
      }, 100);
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (innerTimeout) {
        clearTimeout(innerTimeout);
      }
    };
  }, [initialAvatar, setIsFirstLoaded]);

  useOnAvatarLoaded(
    (_avatarName: string) => {
      if (!isFirstLoaded) {
        loadCurrentAvatar();
      }
    },
    [loadCurrentAvatar, isFirstLoaded]
  );

  useEffect(() => {
    if (isFirstLoaded) {
      unityService.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.CHANGE_AVATAR,
        nextAvatar
      );
    }
  }, [nextAvatar, isFirstLoaded]);
};
