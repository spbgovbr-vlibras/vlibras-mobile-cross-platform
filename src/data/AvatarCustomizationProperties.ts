import { Avatar } from 'constants/types';

export type AvatarCustomizationProperties = {
  cabelo: string;
  calca: string;
  camisa: string;
  corpo: string;
  iris: string;
  olhos: string;
  sombrancelhas: string;
  pos: string;
  logo: string;
  avatar: Avatar;
};

/** Defaults do app mobile (sem logo/branding da Câmara no player). */
export const DefaultAvatarCustomizationProperties: AvatarCustomizationProperties = {
  cabelo: '#000000',
  calca: '#363636',
  camisa: '#1447a6',
  corpo: '#C18471',
  iris: '#000000',
  olhos: '#FFFFFF',
  sombrancelhas: '#000000',
  pos: 'center',
  logo: '',
  avatar: 'icaro',
};

export function updateAvatarCustomizationProperties(
  updates: Partial<AvatarCustomizationProperties>
): AvatarCustomizationProperties {
  return { ...DefaultAvatarCustomizationProperties, ...updates };
}
