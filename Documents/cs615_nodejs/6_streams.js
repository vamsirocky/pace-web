const fs = require('fs');

// Create readable stream
const readStream = fs.createReadStream(__dirname + '/readMe.txt', 'utf8');

// Create writable stream
const writeStream = fs.createWriteStream(__dirname + '/writeMe.txt');

// Pipe readable stream into writable stream
readStream.pipe(writeStream);
