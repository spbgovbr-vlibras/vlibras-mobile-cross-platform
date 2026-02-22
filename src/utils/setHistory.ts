import { NativeStorage } from '@ionic-native/native-storage';
import _ from 'lodash';

// ─── Robust storage helpers with localStorage fallback ───

const storageSet = async (key: string, value: unknown): Promise<void> => {
  // Try NativeStorage first, fallback to localStorage
  try {
    await NativeStorage.setItem(key, value);
  } catch {
    // NativeStorage failed – persist via localStorage instead
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('[storageSet] Failed to save:', key, e);
    }
  }
};

const storageGet = async (key: string, defaultValue: unknown = null): Promise<any> => {
  // Try NativeStorage first
  try {
    const data = await NativeStorage.getItem(key);
    if (data !== null && data !== undefined) {
      return data;
    }
  } catch {
    // NativeStorage unavailable or key not found
  }

  // Fallback: try localStorage
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
  } catch {
    // parse error
  }

  return defaultValue;
};

// ─── Public API ───

export const reloadHistory = async (
  payloadDate: string,
  payloadData: string[] | string,
  key: string
) => {
  try {
    const resultPromise = await storageGet('history', {});

    if (resultPromise[payloadDate]) {
      if (!resultPromise[payloadDate][key]) {
        resultPromise[payloadDate][key] = [];
      }
      const translations = resultPromise[payloadDate][key];
      resultPromise[payloadDate][key] = _.uniq(
        _.concat([payloadData], translations)
      );
    } else {
      resultPromise[payloadDate] = {};
      resultPromise[payloadDate][key] = [payloadData];
    }

    await storageSet('history', resultPromise);
  } catch (e) {
    console.error('[reloadHistory] Error:', e);
  }
};

/**
 * Load the full history object from storage.
 * Returns an empty object `{}` when nothing is stored yet.
 */
export const getHistory = async (): Promise<Record<string, any>> => {
  return storageGet('history', {});
};

export const lastTranslation = (data: string[], key: string): void => {
  if (key === 'video') {
    NativeStorage.setItem('lastTranslation', data).then(
      () => console.log(NativeStorage.getItem('lastTranslation')),
      (error) => console.error('Error storing lastTranslationitem', error)
    );
  }
};
