const router = require('express').Router();

router.use('/orderProductLog', require('./orderProductLog'));


console.log("V1 of internal part API is loaded and available");
module.exports = router;