const router = require('express').Router();

router.use('/orderProductLog', require('./orderProductLog'));

router.use('/', function (req, res, next) {
    console.log('INFORMATION FOR MORGAN !!!!! Support logger call ('+req.url+'):', Date.now());
    next();
  });

console.log("V1 of support API is loaded and available");
module.exports = router;