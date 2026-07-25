import { PlayerKeys } from 'constants/player';
import { Avatar } from 'constants/types';
import {
  AvatarCustomizationProperties,
  DefaultAvatarCustomizationProperties,
  updateAvatarCustomizationProperties,
} from 'data/AvatarCustomizationProperties';
import { CustomizationColors } from 'store/ducks/customization';

import UnityService from './unity';

const LEGACY_SHIRT = new Set(['#202763', '#1c204f']);
const LEGACY_PANTS = new Set(['#121420', '#0e0f18']);

function normalizeHex(hex: string): string {
  return hex.trim().toLowerCase();
}

/** Detecta personalização salva com os defaults antigos do app (pré-camara.json). */
export function isLegacyCustomizationColors(colors: CustomizationColors): boolean {
  return (
    LEGACY_SHIRT.has(normalizeHex(colors.camisa))
    && LEGACY_PANTS.has(normalizeHex(colors.calca))
  );
}

export function camaraCustomizationColors(): CustomizationColors {
  const d = DefaultAvatarCustomizationProperties;
  return {
    corpo: d.corpo,
    cabelo: d.cabelo,
    camisa: d.camisa,
    calca: d.calca,
    iris: d.iris,
  };
}

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
  };
}
