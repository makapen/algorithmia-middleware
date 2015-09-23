var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res) {
  console.log('process.env.algorithmiaKey', process.env)
  request({
    url:' https://api.algorithmia.com/v1/algo/nlp/SentimentAnalysis/0.1.1',
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Authorization': process.env.algorithmiaKey
    },
    json: true,
    body: JSON.stringify('bottom ten reasons you hate your job'),
  }, function(err, returned, body) {
    if (err) {
      console.log('er', err)
    }
    console.log('returned', body)
    res.status(200).send({
      response: body
    })
  })
});

module.exports = router;
