const router = require('express').Router();
const LoggerFactory = require('../../../../logger.js');
const logger = new LoggerFactory().createLogger('System');
jwtService = require("../../../service/jwtService");
router.use(function (req, res, next) {
    if (!req.headers.authorization) {
        req.logger.warn({ message: '[Security] Token not found', className: 'Order Support API' });
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const roles = jwtService.verifyToken(req.headers.authorization).roleName;
        if (roles.indexOf("Support") == -1) {
            return res.status(403).json({ error: `Access denied. : [ ${req.headers.loggerToken}]` })
        }
        return next();

    }
    catch (error) {
        return res.status(403).json({ error: error.message })
    }
})


router.use('/orderProductLog', require('./orderProductLog'));
router.use('/order', require('./order'));

logger.info({ message: "V1 of support API is loaded and available", className: "Index" });
logger.close();
module.exports = router;