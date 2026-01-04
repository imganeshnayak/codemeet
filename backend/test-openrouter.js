const axios = require('axios');

async function testOpenRouter() {
  const apiKey = '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';
  const model = 'meta-llama/llama-3.3-70b-instruct:free';

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
