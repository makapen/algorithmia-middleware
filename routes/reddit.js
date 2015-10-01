var express = require('express');
var router = express.Router();
var request = require('request');
var async = require('async');
var Algorithmia = require('algorithmia');
var htmlToText = require('html-to-text');
var _ = require('underscore');

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
    .algo("algo://tags/ScrapeRSS/0.1.5")
    .pipe(input)
    .then(function(response) {
      if (response.error) {
        return cb(response.error);
      }
      var descriptions = response.result.map(function(item) {
        return {
          description: item.description,
          title: item.title,
          url: item.url
        }
      })
      cb(null, descriptions);
    });
};

router.get('/', function(req, res, next) {
  var resultsWithSentiment = [];


  //now go and fetch reddit and start pushing in queue tasks
  getRedditFeed(function(err, result) {
    if (err) {
      return next(err);
    }

    // add some items to the queue
    var tasks = result.map(function(redditItem) {
      var parsedText = htmlToText.fromString(redditItem.description);
      parsedText = parsedText.slice(0, 200);//first 200 words

      redditItem.parsedText = parsedText


      return function(callback) {
        var parsedText = redditItem.parsedText;
        var timedOut = false;

        var activeTimeout = setTimeout(function() {
          timedOut = true;
          resultsWithSentiment.push(_.extend({}, redditItem, {
            sentimentScore: 1
          }));
          callback();
        }, 1500);
        getSentimentAnalysis(parsedText, function(err, sentimentScore) {
          if (err) return callback(err);
          if (timedOut) {
            return;
          }

          resultsWithSentiment.push(_.extend({}, redditItem, {
            sentimentScore: sentimentScore
          }));
          clearTimeout(activeTimeout);
          callback();
        });
      };
    });

    async.parallel(tasks, function(err, result) {
      if (err) return next(err);

      res.status(200).send(resultsWithSentiment);
    });
  });
});

module.exports = router;
