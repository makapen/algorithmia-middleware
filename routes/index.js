var express = require('express');
var router = express.Router();
var packageInfo = require('../package');

router.get('/', function(req, res) {
  console.log(packageInfo.version);
  res.status(200).send({
    status: "awesome",
    version: packageInfo.version
  });
});

module.exports = router;
