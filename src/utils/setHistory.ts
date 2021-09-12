import { NativeStorage } from '@ionic-native/native-storage';

export const reloadHistory = async (
  payloadDate: any,
  payloadData: any,
  key: any,
) => {
  const promiseHistory = NativeStorage.getItem('history').then(
    data => data,
    error => {
      return {};
    },
  );

  const resultPromise = await promiseHistory;

  if (resultPromise[payloadDate]) {
    if (resultPromise[payloadDate][key]) {
      resultPromise[payloadDate][key].unshift(payloadData);
    } else {
      resultPromise[payloadDate][key] = [];
      resultPromise[payloadDate][key].unshift(payloadData);
    }
  } else {
    resultPromise[payloadDate] = {};
    resultPromise[payloadDate][key] = [payloadData];
  }

  NativeStorage.setItem('history', resultPromise).then(
    () => console.log(NativeStorage.getItem('history')),
    error => console.error('Error storing item', error),
  );
};
