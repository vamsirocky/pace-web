const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log('Request was made: ' + req.url);

  if (req.url === '/' || req.url === '/home') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'index.html')).pipe(res);

  } else if (req.url === '/contact') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, 'contact.html')).pipe(res);

  } else if (req.url === '/api') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const data = {
      name: 'Vamsi Krishna Kancharapu',
      studentID: '24252051',
      course: 'CS615 - Internet Solutions Engineering'
    };
    res.end(JSON.stringify(data));

  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    fs.createReadStream(path.join(__dirname, '404.html')).pipe(res);
  }
});

server.listen(3000, '127.0.0.1');
console.log('Server running at http://localhost:3000');
