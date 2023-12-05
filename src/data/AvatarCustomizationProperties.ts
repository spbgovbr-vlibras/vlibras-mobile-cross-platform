import { Avatar } from 'constants/types';

type AvatarCustomizationProperties = {
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

export const DefaultAvatarCustomizationProperties: AvatarCustomizationProperties = {
  cabelo: '#000000',
  calca: '#0e0f18',
  camisa: '#1c204f',
  corpo: '#c18471',
  iris: '#000000',
  olhos: '#ffffff',
  sombrancelhas: '#FF0000',
  pos: 'center',
  logo: 'https://vlibras.gov.br/config/img/logo-lavid.png',
  avatar: 'icaro',
};

export function updateAvatarCustomizationProperties(
  updates: Partial<AvatarCustomizationProperties>
): AvatarCustomizationProperties {
  return { ...DefaultAvatarCustomizationProperties, ...updates };
}