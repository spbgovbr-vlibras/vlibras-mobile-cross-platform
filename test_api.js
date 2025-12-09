const axios = require('axios');

async function testApi() {
  try {
    console.log('Fetching tags...');
    const response = await axios.get('https://repositorio-dth.vlibras.lavid.ufpb.br/api/tags');
    console.log('Status:', response.status);
    console.log('Data length:', response.data.length);
    console.log('First tag:', response.data[0]);
  } catch (error) {
    console.error('Error fetching tags:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testApi();

