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
  review: string;
  rating: 'good' | 'bad';
}

export async function sendReview(data: SendReviewBody): Promise<any> {
  try {
    const gloss = await translate({ text: data.review });
    await suggestionGloss.post('/', { ...data, translation: gloss });
  } catch (error) {
    console.log(error);
  }
}

export default suggestionGloss;
