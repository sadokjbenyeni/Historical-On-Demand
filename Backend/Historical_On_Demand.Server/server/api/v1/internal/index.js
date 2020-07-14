const router = require('express').Router();
const LoggerFactory = require('../../../../logger.js');
const logger = new LoggerFactory().createLogger('System');

router.use('/orderProductLog', require('./orderProductLog'));


logger.info({ message: "V1 of internal part API is loaded and available", className: "Index"});
logger.close();
module.exports = router;