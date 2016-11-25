// jshint esversion: 6
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.json());

app.get('/', function (req, res) {
  res.send('Hello World!');
});
app.post('/api/v1/namespaces/:namespace/triggers/:name', function (req, res) {
  console.log(req.url);
  console.log(req.body);
  res.send('Hello World!');
});

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})