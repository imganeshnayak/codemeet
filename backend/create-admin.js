const axios = require('axios');

async function createAdmin() {
    try {
        const response = await axios.post('http://localhost:5000/api/seed/admin', {
            name: 'Admin',
            email: 'admin@codemeet.com',
            password: 'Admin@123'
        });

        console.log('✅ Admin created successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.data.message);
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

createAdmin();
