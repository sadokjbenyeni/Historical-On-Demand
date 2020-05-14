const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const OrderProductLog = mongoose.model('OrderProductLog');


const OrderProductLogService = require('../../../service/orderProductLogService');

router.get('/:orderid', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var user = await User.findOne({ token: req.headers.authorization }, { _id: true }).exec();
  if (!user || !user.roleName || (!user.roleName.includes("Support") && !user.roleName.includes("Administration"))) {
    req.logger.warn({message: '[Security] Token not found', className: 'orderProductLog support API'});
    return res.status(404);
  }
  var logs = await OrderProductLog.find({ orderId: req.params.orderId }).exec();
  return res.status(200).json({ logs: logs });  
});

router.get('/:orderid/:idx', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var user = await User.findOne({ token: req.headers.authorization }, { _id: true }).exec();
  if (!user || !user.roleName || (!user.roleName.includes("Support") && !user.roleName.includes("Administration"))) {
    let token = req.headers.loggerToken;
    req.logger.warn({message: '[Security] Token not found', className: 'orderProductLog support API'});
    return res.status(404);
  }
  var logs = await OrderProductLog.find({ orderId: req.params.orderId, productId: req.params.idx }).exec();
  return res.status(200).json({ logs: logs });
});



module.exports = router;