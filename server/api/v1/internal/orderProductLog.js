const router = require('express').Router();
const mongoose = require('mongoose');

// const User = mongoose.model('User');
const OrderProductLog = mongoose.model('OrderProductLog');
// const OrderProductLogService = require('../../../service/orderProductLogService');

router.put('/', async (req, res) => {    
    req.logger.info({ message: 'pushing the information in logs product for order...', className: 'orderProductLog API' });
    if (!req.headers.internal) {
        return res.status(401);
    }
    var logs = req.body;
    try {
        var logsDbo = await OrderProductLog.findOne({ id_cmd: req.body.id_undercmd }).exec();
        if (!logsDbo) {
            logsDbo = new OrderProductLog();
        }
        logsDbo.status = logs.status;
        logsDbo.extract = logs.extract;
        logsDbo.referer = logs.referer;
        logsDbo.orderId = logs.orderId;
        logsDbo.id_undercmd = logs.id_undercmd;
        logsDbo.productId = logs.productId;
        logsDbo.date = logs.date;
        logsDbo.idUser = logs.idUser;
        logsDbo.status = logs.status;
        logsDbo.state_description = logs.state_description;
        logsDbo.log = logs.log;    
        await logsDbo.save();
    }
    catch (err) {
        req.logger.error({ message: err.message, error: error, className: 'orderProductLog internal API' });
        return res.status(503).json({ message: "Unhandle exception, please contact support with '" + req.headers.loggerToken + "' identifier"});
    }
    return res.status(200).json({ logs: logs });
});

module.exports = router;