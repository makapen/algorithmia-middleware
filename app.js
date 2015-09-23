var express = require('express'),
path = require('path'),
bodyParser = require('body-parser'),
request = require('request'),
cors = require('cors');

var routes = require('./routes/index');
var sentimentRoute = require('./routes/sentiment');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//setup passport authentication
app.use(cors());
app.options('*', cors());

// view engine setup
app.set('view engine', null);

//setup CORS

app.use('/', routes);
app.use('/sentiment', sentimentRoute);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {

    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err,
            title: err.title || 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {},
        title: err.title || 'error'
    });
});

module.exports = app;
