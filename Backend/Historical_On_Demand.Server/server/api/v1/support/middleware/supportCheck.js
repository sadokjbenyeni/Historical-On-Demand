const jwtService = require("../../../../service/jwtService");

module.exports.checkSupport = function (req, res, next) {
    if (!req.headers.authorization) {
        req.logger.warn({ message: '[Security] Token not found', className: 'Order Support API' });
        return res.status(401).json({ error: "No token provided" });
    }
    try {
        const roles = jwtService.verifyToken(req.headers.authorization).roleName;
        if (roles.indexOf("Support") == -1) return res.status(403).json({ error: `Access denied. : [ ${req.headers.loggerToken}]` });
        return next();
    }
    catch (error) {
        return res.status(403).json({ error: error.message })
    }
}