import { PlayerKeys } from 'constants/player';
import { Avatar } from 'constants/types';
import {
  AvatarCustomizationProperties,
  DefaultAvatarCustomizationProperties,
  updateAvatarCustomizationProperties,
} from 'data/AvatarCustomizationProperties';
import { CustomizationColors } from 'store/ducks/customization';

import UnityService from './unity';

export function buildAvatarCustomizationPayload(
  updates: Partial<AvatarCustomizationProperties>
): string {
  return JSON.stringify(updateAvatarCustomizationProperties(updates));
}

export function applyAvatarCustomizationToUnity(
  updates: Partial<AvatarCustomizationProperties>
): void {
  if (!UnityService.getPlayerInstance().getIsReady()) return;

  UnityService.getPlayerInstance().send(
    PlayerKeys.CUSTOMIZATION_BRIDGE,
    PlayerKeys.APPLY_JSON,
    buildAvatarCustomizationPayload(updates)
  );
}

/** Reaplica após o avatar montar materiais (evita rosto/corpo dessincronizados). */
export function applyAvatarCustomizationWithRetry(
  updates: Partial<AvatarCustomizationProperties>
): () => void {
  applyAvatarCustomizationToUnity(updates);

  const delays = [150, 500, 1200];
  const timers = delays.map((ms) =>
    window.setTimeout(() => applyAvatarCustomizationToUnity(updates), ms)
  );

  return () => {
    timers.forEach((id) => window.clearTimeout(id));
  };
}

export function customizationColorsToPayload(
  avatar: Avatar,
  colors: CustomizationColors
): Partial<AvatarCustomizationProperties> {
  return {
    avatar,
    corpo: colors.corpo,
    cabelo: colors.cabelo,
    camisa: colors.camisa,
    calca: colors.calca,
    iris: colors.iris,
    pos: DefaultAvatarCustomizationProperties.pos,
    logo: DefaultAvatarCustomizationProperties.logo,
  };
}
