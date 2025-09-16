const http = require('http');

const server = http.createServer(function(req, res) {
  console.log('Request was made: ' + req.url);

  res.writeHead(200, { 'Content-Type': 'application/json' });

  const myObject = {
    name: 'Vamsi Krishna Kancharapu',
    studentID: '24252051',
    course: 'CS615 - Internet Solutions Engineering'
  };

  res.end(JSON.stringify(myObject));
});

server.listen(3000, '127.0.0.1');
console.log('Listening to port 3000...');
