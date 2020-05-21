const router = require('express').Router()
const LoggerFactory = require('../../logger.js');
const logger = new LoggerFactory().createLogger('System');

router.use("/v1", require('./v1'));

logger.info({ message: "API Versionning loaded.", className: "Index" });
logger.close();

module.exports = router;
