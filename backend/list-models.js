const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

async function listModels() {
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
        console.log(`Fetching models from: ${url.replace(API_KEY, 'HIDDEN_KEY')}`);

        const response = await axios.get(url);
        const models = response.data.models;

        console.log('\nModels supporting generateContent:');
        models.filter(m => m.supportedGenerationMethods.includes('generateContent') && m.name.includes('gemini'))
            .forEach(model => console.log(model.name));
    } catch (error) {
        console.error('Error listing models:', error.response ? error.response.data : error.message);
    }
}

listModels();
