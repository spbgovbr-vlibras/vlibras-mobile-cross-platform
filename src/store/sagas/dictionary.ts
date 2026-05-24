import { all, takeLatest, put, call, select } from 'redux-saga/effects';

import { getTags, getSignsByTag } from 'services/api';
import { fetchBundles } from 'services/regionalism';
import { Creators, DictionaryState, Metadata } from 'store/ducks/dictionary';
import { TagSignsResponse, Tag, Words } from 'models/dictionary';

function* fetchWords(
  action: ReturnType<typeof Creators.fetchWords.request>
): Generator<unknown, void, any> {
  const { page, limit, name, tag } = action.payload;
  let allWords: string[] = [];

  try {
    if (page === 1) {
      if (!tag) {
        // A-Z: Check cache first
        const dictionaryState: DictionaryState = yield select((state: any) => state.dictionaryReducer);
        const cachedWords = dictionaryState.allWordsCache;

        if (cachedWords && cachedWords.length > 0) {
          allWords = cachedWords;
        } else {
          const response: TagSignsResponse = yield call(getSignsByTag, '');
          allWords = response.signs || [];
          yield put(Creators.setAllWordsCache(allWords));
        }
      } else {
        // Category: Fetch from API
        const response: TagSignsResponse = yield call(getSignsByTag, tag);
        allWords = response.signs || [];
      }
      yield put(Creators.setAllWords(allWords));
    } else {
      // Get from state
      const dictionaryState: DictionaryState = yield select((state: any) => state.dictionaryReducer);
      allWords = dictionaryState.allCurrentWords;
    }

    // Filter
    let filteredWords = allWords;
    if (name) {
      // O componente passa `${searchText}%` (estilo SQL LIKE). Como o filtro
      // aqui \u00e9 client-side com `.includes`, removemos os `%` para n\u00e3o
      // tratarem como caractere literal e quebrarem a busca.
      const cleanedName = name.replace(/%/g, '').trim();
      if (cleanedName) {
        const lowerName = cleanedName.toLowerCase();
        filteredWords = allWords.filter(w => w.toLowerCase().includes(lowerName));
      }
    }

    // Pagination
    const total = filteredWords.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const end = start + limit;
    const slicedWords = filteredWords.slice(start, end);

    // Map to Words[]
    const data: Words[] = slicedWords.map((w, index) => ({
      id: start + index,
      name: w
    }));

    const meta: Metadata = {
      current_page: page,
      first_page: 1,
      last_page: totalPages || 1,
      total: total,
      per_page: limit,
      hasNextPage: page < (totalPages || 1),
      first_page_url: '',
      last_page_url: '',
      next_page_url: '',
      previous_page_url: ''
    };

    yield put(Creators.fetchWords.success({ meta, data }));
  } catch (error) {
    yield put(Creators.fetchWords.failure(error));
  }
}

function* fetchRegionalistWords(
  action: ReturnType<typeof Creators.fetchRegionalismWords.request>
): Generator<unknown, void, [string]> {
  try {
    const response = yield fetchBundles(action.payload.abbrreviation);
    yield put(Creators.fetchRegionalismWords.success(
      { data: response }
    ));
  } catch (error) {
    yield put(Creators.fetchRegionalismWords.failure(error));
  }
}

function* fetchTags(): Generator<unknown, void, Tag[]> {
  try {
    const tags = yield call(getTags);
    yield put(Creators.fetchTags.success(tags));
  } catch (error) {
    yield put(Creators.fetchTags.failure(error));
  }
}

export default all(
  [
    takeLatest(Creators.fetchWords.request, fetchWords),
    takeLatest(Creators.fetchRegionalismWords.request, fetchRegionalistWords),
    takeLatest(Creators.fetchTags.request, fetchTags)
  ]
);
