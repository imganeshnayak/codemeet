const axios = require('axios');

async function registerUser() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/signup', {
            name: 'Test User',
            email: 'user@codemeet.com',
            password: 'User@123'
        });

        console.log('✅ User registered successfully!');
        console.log('\nUser Info:');
        console.log('Name:', response.data.data.user.name);
        console.log('Email:', response.data.data.user.email);
        console.log('\nCredentials:');
        console.log('Email: user@codemeet.com');
        console.log('Password: User@123');
        console.log('\nToken:', response.data.data.accessToken);
        console.log('\n💡 Now log in with these credentials at /login');
    } catch (error) {
        if (error.response) {
            console.log('❌ Error:', error.response.data.message);
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

registerUser();
