// Test OpenRouter API directly

const OPENROUTER_API_KEY = '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';
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

async function testOpenRouter() {
  console.log('🧪 Testing OpenRouter API...\n');
  
  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'CodeMeet - Test',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say hello in one sentence'
          }
        ]
      })
    });

    console.log('📡 Response Status:', response.status);
    
    const text = await response.text();
    console.log('\n📄 Raw Response:', text);
    
    if (response.ok) {
      const data = JSON.parse(text);
      console.log('\n✅ Success!');
      console.log('AI Response:', data.choices[0].message.content);
    } else {
      console.log('\n❌ Error:', text);
    }
  } catch (error) {
    console.error('\n💥 Exception:', error.message);
    console.error('Stack:', error.stack);
  }
}

testOpenRouter();
