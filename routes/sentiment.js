var express = require('express');
var router = express.Router();
var request = require('request');

router.post('/', function(req, res) {
  request({
    url:' https://api.algorithmia.com/v1/algo/nlp/SentimentAnalysis/0.1.1',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': process.env.algorithmiaKey
    },
    json: true,
    body: JSON.stringify(req.body),
  }, function(err, returned, body) {
    if (err) {
      console.log('er', err)
    }
    res.status(200).send(body)
  })
});

module.exports = router;
