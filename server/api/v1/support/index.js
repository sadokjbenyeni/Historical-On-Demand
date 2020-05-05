const router = require('express').Router();

router.use('/orderProductLog', require('./orderProductLog'));

console.log("V1 of support API is loaded and available");
module.exports = router;