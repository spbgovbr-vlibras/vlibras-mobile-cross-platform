import { PlayerKeys } from './player';

export interface EmotionOption {
  /** Display label and identifier (matches `selectedEmotion` in TranslationContext). */
  id: string;
  /** Visible label in pickers. */
  label: string;
  /** PlayerKeys command sent to Unity to apply this emotion. */
  applyKey: PlayerKeys;
  /** Inline SVG markup (rendered with dangerouslySetInnerHTML) – the same
   *  blue glyphs already used in the DrawerMenu. */
  svg: string;
}

const ICON_NEUTRA = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><path d="M9 14h6v1.5H9z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;
const ICON_FELIZ = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;
const ICON_TRISTE = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M15.5 14c-1.25 0-2.25 1.01-2.25 2.25h-2.5C10.75 15.01 9.75 14 8.5 14 7.12 14 6 15.12 6 16.5v1h12v-1c0-1.38-1.12-2.5-2.5-2.5z"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/></svg>`;
const ICON_RAIVA = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M12,2C6.47,2,2,6.47,2,12c0,5.53,4.47,10,10,10s10-4.47,10-10C22,6.47,17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8 s3.59-8,8-8s8,3.59,8,8S16.41,20,12,20z"/><path d="M15.5,9.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S16.33,9.5,15.5,9.5z"/><path d="M8.5,9.5c-0.83,0-1.5,0.67-1.5,1.5s0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5S9.33,9.5,8.5,9.5z"/><path d="M12,14c-1.48,0-2.75,0.81-3.45,2h6.89c-0.7-1.19-1.97-2-3.44-2z"/></g></g></g></svg>`;
const ICON_DESGOSTO = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z M7,14h10v1.5H7V14z"/></svg>`;
const ICON_MEDO = `<svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><g><rect fill="none" height="24" width="24"/></g><g><g><path d="M12,2C6.47,2,2,6.47,2,12s4.47,10,10,10s10-4.47,10-10S17.53,2,12,2z M12,20c-4.41,0-8-3.59-8-8s3.59-8,8-8s8,3.59,8,8 S16.41,20,12,20z"/><circle cx="15.5" cy="9.5" r="1.25"/><circle cx="8.5" cy="9.5" r="1.25"/><path d="M12,13.5c-2.33,0-4.31,1.46-5.11,3.5h10.22C16.31,14.96,14.33,13.5,12,13.5z"/></g></g></svg>`;
const ICON_SURPRESA = `<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#1447a6"><circle cx="12" cy="16" r="2"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99,2C6.47,2,2,6.48,2,12s4.47,10,9.99,10C17.52,22,22,17.52,22,12S17.52,2,11.99,2z M12,20c-4.42,0-8-3.58-8-8 s3.58-8,8-8s8,3.58,8,8S16.42,20,12,20z"/></svg>`;

export const EMOTION_OPTIONS: EmotionOption[] = [
  { id: 'Neutra', label: 'Neutra', applyKey: PlayerKeys.APPLY_DEFAULT_EMOTION, svg: ICON_NEUTRA },
  { id: 'Feliz', label: 'Feliz', applyKey: PlayerKeys.APPLY_HAPPY_EMOTION, svg: ICON_FELIZ },
  { id: 'Triste', label: 'Triste', applyKey: PlayerKeys.APPLY_SAD_EMOTION, svg: ICON_TRISTE },
  { id: 'Raiva', label: 'Raiva', applyKey: PlayerKeys.APPLY_ANGRY_EMOTION, svg: ICON_RAIVA },
  { id: 'Desgosto', label: 'Desgosto', applyKey: PlayerKeys.APPLY_DISGUST_EMOTION, svg: ICON_DESGOSTO },
  { id: 'Medo', label: 'Medo', applyKey: PlayerKeys.APPLY_FEAR_EMOTION, svg: ICON_MEDO },
  { id: 'Surpresa', label: 'Surpresa', applyKey: PlayerKeys.APPLY_SURPRISE_EMOTION, svg: ICON_SURPRESA },
];
