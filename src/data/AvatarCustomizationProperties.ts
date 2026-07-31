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

/** Valores oficiais do widget VLibras (camara.json). */
export const DefaultAvatarCustomizationProperties: AvatarCustomizationProperties = {
  cabelo: '#000000',
  calca: '#1F265F',
  camisa: '#005B38',
  corpo: '#C18471',
  iris: '#000000',
  olhos: '#FFFFFF',
  sombrancelhas: '#000000',
  pos: 'left',
  logo: 'https://vlibras.gov.br/config/img/camara.png',
  avatar: 'icaro',
};

export function updateAvatarCustomizationProperties(
  updates: Partial<AvatarCustomizationProperties>
): AvatarCustomizationProperties {
  return { ...DefaultAvatarCustomizationProperties, ...updates };
}