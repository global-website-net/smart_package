const bcrypt = require('bcryptjs');

// Password to hash
const password = 'admin123'; // Change this to your desired password

// Generate hash
const salt = bcrypt.genSaltSync(10);
const hash = bcrypt.hashSync(password, salt);

console.log('Password:', password);
console.log('Generated hash:', hash);

// Verify the hash works
const isValid = bcrypt.compareSync(password, hash);
console.log('Verification test:', isValid); 