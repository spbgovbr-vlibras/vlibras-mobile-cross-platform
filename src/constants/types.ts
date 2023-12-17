export enum TranslationRequestType {
  VIDEO_SHARE,
  GLOSS_ONLY,
}

export type Avatar = 'hozana' | 'icaro' | 'guga';

export const regex =
  // eslint-disable-next-line no-useless-escape
  /^(?![!@#$%^&"'*()_+{}\[\]:;<>,.?~\\ ])(?!.*[!@#$%^&*"'()_+{}\[\]:;<>,/.?~=\\]{2}).*$/s;