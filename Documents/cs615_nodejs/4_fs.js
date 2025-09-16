const fs = require('fs');
const readMe = fs.readFileSync('readMe.txt', 'utf8');
fs.writeFileSync('writeMe.txt', readMe);
