const router = require('express').Router();
const LoggerFactory = require('../../../logger.js');
const logger = new LoggerFactory().createLogger('System');

router.use("/support", require('./support'));
router.use("/administrator", require('./administrator'));

router.use("/internal", require('./internal'));

router.use('/user', require('./user'));
router.use('/role', require('./role'));
router.use('/countries', require('./countries'));
router.use('/companytype', require('./companytype'));
router.use('/verifyvat', require('./vat'));
router.use('/payment', require('./payment'));
router.use('/mail', require('./mailer'));
router.use('/pdf', require('./pdf'));
router.use('/order', require('./order'));
router.use('/upload', require('./upload'));
router.use('/cmd', require('./todo'));
router.use('/flux', require('./flux'));
router.use('/currency', require('./currency'));
router.use('/search', require('./elastic'));
router.use('/config', require('./config'));
router.use('/sales', require('./sales'));
router.use('/deliverables', require('./deliverables'));
router.use('/invoice', require('./invoice'));

logger.info({ message: "V1 of API is loaded and available", className: "Index" });
logger.close();
module.exports = router;