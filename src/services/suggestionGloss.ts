import axios from 'axios';

const suggestionGloss = axios.create({
  baseURL: 'https://traducao2.vlibras.gov.br/review',
  headers: {
    'Content-type': 'application/json',
  },
});

export async function sendReview(
  suggestion: string,
  text: string,
  rating: 'good' | 'bad',
): Promise<any> {
  try {
    await suggestionGloss.post('/', {
      text,
      translation: suggestion,
      rating: 'good',
      review: suggestion,
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default suggestionGloss;
