import { NativeStorage } from '@ionic-native/native-storage';
import _ from 'lodash';

export const reloadHistory = async (
  payloadDate: string,
  payloadData: string[] | string,
  key: string
) => {
  const promiseHistory = NativeStorage.getItem('history').then(
    (data) => data,
    (error) => {
      return {};
    }
  );

  const resultPromise = await promiseHistory;

  if (resultPromise[payloadDate]) {
    if (!resultPromise[payloadDate][key]) {
      resultPromise[payloadDate][key] = [];
    }
    const translations = resultPromise[payloadDate][key];
    resultPromise[payloadDate][key] = _.uniq(translations.unshift(payloadData));
  } else {
    resultPromise[payloadDate] = {};
    resultPromise[payloadDate][key] = [payloadData];
  }

  NativeStorage.setItem('history', resultPromise).then(
    () => console.log(NativeStorage.getItem('history')),
    (error) => console.error('Error storing item', error)
  );
};

export const lastTranslation = (data: string[], key: string): void => {
  if (key === 'video') {
    NativeStorage.setItem('lastTranslation', data).then(
      () => console.log(NativeStorage.getItem('lastTranslation')),
      (error) => console.error('Error storing lastTranslationitem', error)
    );
  }
};
