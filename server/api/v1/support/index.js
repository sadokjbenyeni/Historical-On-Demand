const router = require('express').Router();
const LoggerFactory = require('../../../../logger.js');
const logger = new LoggerFactory().createLogger('System');
const supportcheck = require('./middleware/supportCheck')

router.use(function (req, res, next) { supportcheck.checkSupport(req, res, next) })
router.use('/orderProductLog', require('./orderProductLog'));
router.use('/order', require('./order'));

logger.info({ message: "V1 of support API is loaded and available", className: "Index" });
logger.close();
module.exports = router;