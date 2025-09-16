const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Homepage'));
app.get('/contact', (req, res) => res.send('Contact Page'));
app.get('/profile/:id', (req, res) => {
  res.send('Profile ID: ' + req.params.id);
});

app.listen(3000);
