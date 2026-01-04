const axios = require('axios');

async function testGemini() {
    const apiKey = 'AIzaSyB-axy9Mi5OPCmqHA4Vh-VGb-G26gTMmXo';
    const model = 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    console.log(`Testing ${model}...`);

    try {
        const response = await axios.post(url, {
            contents: [{
                parts: [{ text: "Explain how AI works in a few words" }]
            }]
        });

        console.log('Status:', response.status);
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testGemini();
