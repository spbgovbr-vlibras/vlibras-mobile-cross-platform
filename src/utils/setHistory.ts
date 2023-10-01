import { NativeStorage } from '@ionic-native/native-storage';
import _ from 'lodash';

export const reloadHistory = async (
  payloadDate: string,
  payloadData: string[] | string,
  key: string
) => {
  try {
    const resultPromise = await getStorageItem('history', {});
    if (resultPromise[payloadDate]) {
      if (!resultPromise[payloadDate][key]) {
        resultPromise[payloadDate][key] = [];
      }
      // eslint-disable-next-line prefer-const
      const translations = resultPromise[payloadDate][key];
      resultPromise[payloadDate][key] = _.uniq(_.concat([payloadData], translations));
    } else {
      resultPromise[payloadDate] = {};
      resultPromise[payloadDate][key] = [payloadData];
    }
  
    await NativeStorage.setItem('history', resultPromise);
  // eslint-disable-next-line no-empty
  } catch { }
};

export const lastTranslation = (data: string[], key: string): void => {
  if (key === 'video') {
    NativeStorage.setItem('lastTranslation', data).then(
      () => console.log(NativeStorage.getItem('lastTranslation')),
      (error) => console.error('Error storing lastTranslationitem', error)
    );
  }
};

const getStorageItem = async (key: string, defaultValue: unknown) => {
  try {
    const data = await NativeStorage.getItem(key);
    return data;
  } catch (error) {
    return defaultValue;
  }
}
