const axios = require('axios');

async function loginAdmin() {
    try {
        const response = await axios.post('http://localhost:5000/api/admin/auth/login', {
            email: 'admin@codemeet.com',
            password: 'Admin@123'
        });

        console.log('✅ Login successful!');
        console.log('\n📋 Save this token for API requests:\n');
        console.log('Token:', response.data.token);
        console.log('\n👤 Admin Info:');
        console.log('Name:', response.data.admin.name);
        console.log('Email:', response.data.admin.email);
        console.log('Role:', response.data.admin.role);
        console.log('\n💡 To use in requests, add this header:');
        console.log('Authorization: Bearer ' + response.data.token);
    } catch (error) {
        if (error.response) {
            console.log('❌ Login failed:', error.response.data.message || error.response.data.error);
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

loginAdmin();
