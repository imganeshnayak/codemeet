// Run this script with: node hash.js
// Make sure you have bcryptjs installed: npm install bcryptjs

const bcrypt = require('bcryptjs');
const password = 'yourpassword'; // Change this to your desired admin password

bcrypt.hash(password, 10, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
