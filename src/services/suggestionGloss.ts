import axios from 'axios';

import { translate } from './translate';

const suggestionGloss = axios.create({
  baseURL: 'https://traducao2.vlibras.gov.br/review',
  headers: {
    'Content-type': 'application/json',
  },
});

export interface SendReviewBody {
  text: string;
  translation: string;
  review: string;
  rating: 'good' | 'bad';
}

export async function sendReview(data: SendReviewBody): Promise<any> {
  try {
    await suggestionGloss.post('/', data);
  } catch (error) {
    console.log(error);
  }
}

export default suggestionGloss;
