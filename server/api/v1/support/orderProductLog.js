const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const OrderProductLog = mongoose.model('OrderProductLog');
const Order = mongoose.model('Order');


const OrderProductLogService = require('../../../service/orderProductLogService');

router.get('/:orderid', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var user = await User.findOne({ token: req.headers.authorization, roleName: "Support" }, { _id: true }).exec();
  if (!user) {
      req.logger.warn({ message: '[Security] Token not found', className: 'OrderProductLog support API'});
      return res.status(403).json({ message: "Access denied. Please contact support with identifier: [" + req.headers.loggerToken + "]"});
  }
  var order = await Order.findOne({ _id: req.params.orderid }).exec();
  var logs = await OrderProductLog.find({ orderId: order.id }).exec();
  return res.status(200).json({ logs: logs });  
});

router.get('/:orderid/:idx', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var user = await User.findOne({ token: req.headers.authorization, roleName: "Support" }, { _id: true }).exec();
  if (!user) {
      req.logger.warn({ message: '[Security] Token not found', className: 'OrderProductLog support API'});
      return res.status(403).json({ message: "Access denied. Please contact support with identifier: [" + req.headers.loggerToken + "]"});
  }
  var order = await Order.findOne({ _id: req.params.orderId }).exec();
  var logs = await OrderProductLog.find({ orderId: order.id, productId: req.params.idx }).exec();
  return res.status(200).json({ logs: logs });
});



module.exports = router;