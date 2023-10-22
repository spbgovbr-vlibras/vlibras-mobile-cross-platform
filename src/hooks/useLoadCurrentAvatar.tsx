import { useCallback, useEffect, useState } from 'react';

import { PlayerKeys } from 'constants/player';
import { Avatar } from 'constants/types';
import UnityService from 'services/unity';

import { useOnAvatarLoaded } from './unityHooks';

export const useLoadCurrentAvatar = (
  initialAvatar: Avatar,
  unityService: UnityService,
  nextAvatar: Avatar
) => {
  const [isFirstLoaded, setIsFirstLoaded] = useState(false);

  const loadCurrentAvatar = useCallback(() => {
    const timeout = setTimeout(() => {
      unityService.send(
        PlayerKeys.PLAYER_MANAGER,
        PlayerKeys.CHANGE_AVATAR,
        initialAvatar
      );
      setIsFirstLoaded(true);
    }, 500);

    return () => clearTimeout(timeout);
  }, [initialAvatar, setIsFirstLoaded]);

  useOnAvatarLoaded(
    (_avatarName: string) => {
      loadCurrentAvatar();
    },
    [loadCurrentAvatar]
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
