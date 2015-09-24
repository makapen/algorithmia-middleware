var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var Algorithmia = require('algorithmia');
var htmlToText = require('html-to-text');

var getSentimentAnalysis = function(message, cb) {
  Algorithmia(process.env.algorithmiaKey)
    .algo("algo://StanfordNLP/SentimentAnalysis/0.1.0")
    .pipe(message)
    .then(function(response) {
      if (response.error) {
        return cb(response.error);
      }
      cb(null, response.result);
    });
};

var getRedditFeed = function(cb) {
  var input = "https://www.reddit.com/r/concrete.rss";
  Algorithmia(process.env.algorithmiaKey)
    .algo("algo://tags/ScrapeRSS/0.1.2")
    .pipe(input)
    .then(function(response) {
      if (response.error) {
        return cb(response.error);
      }
      var descriptions = response.result.map(function(item) {
        return item.description;
      })
      cb(null, descriptions);
    });
};

router.get('/', function(req, res, next) {
  var timesCalled = 0;

  getRedditFeed(function(err, result) {
    if (err) {
      return next(err);
    }
    var resultsWithSentiment = [];

    var q = async.queue(function(task, callback) {
      var parsedText = task.parsedText;
      var timedOut = false;

      var activeTimeout = setTimeout(function() {
        timedOut = true;
        callback({
          parsedText: task.parsedText,
          rawHtml: task.rawHtml
        });
      }, 1500);
      getSentimentAnalysis(parsedText, function(err, sentimentScore) {
        if (err) return callback(err);
        if (timedOut) {
          return;
        }

        resultsWithSentiment.push({
          parsedText: task.parsedText,
          rawHtml: task.rawHtml,
          sentimentScore: sentimentScore
        });
        clearTimeout(activeTimeout);
        callback();
      });
    }, 14);


    // assign a callback
    q.drain = function() {
      res.status(200).send(resultsWithSentiment);
      q.kill();
    }

    // add some items to the queue
    var parsedResult = result.map(function(descriptionItem) {
      var parsedText = htmlToText.fromString(descriptionItem);
      parsedText = parsedText.slice(0, 200);//first 200 words
      return {
        rawHtml: descriptionItem,
        parsedText: parsedText
      };
    });

    q.push(parsedResult);
  });
});

module.exports = router;
