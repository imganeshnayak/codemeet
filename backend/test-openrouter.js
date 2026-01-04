const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const axios = require('axios');

async function testOpenRouter() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL || 'google/gemma-2-9b-it:free';

  if (!apiKey) {
    console.error('❌ Error: OPENROUTER_API_KEY not found in .env file');
    return;
  }

  console.log(`Testing OpenRouter with model: ${model}`);

  try {

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          { role: 'user', content: 'Hello, how are you?' }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        }
      }
    );

    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    console.error('Status:', error.response?.status);
  }
}

testOpenRouter();
