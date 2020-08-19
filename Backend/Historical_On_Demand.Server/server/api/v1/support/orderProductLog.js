const router = require('express').Router();
const mongoose = require('mongoose');

const OrderProductLog = mongoose.model('OrderProductLog');
const Order = mongoose.model('Order');

const orderSerivce = require("../../../service/orderService");

const OrderProductLogService = require('../../../service/orderProductLogService');

router.get('/:orderid', async (req, res) => {
  if (!req.headers.authorization) return res.status(401);
  var order = await orderSerivce.getOrderById(req.params.orderid);
  var logs = await OrderProductLog.find({ orderId: order.id }).exec();
  return res.status(200).json({ logs: logs });
});

router.get('/:orderid/:idx', async (req, res) => {
  var order = await orderSerivce.getOrderById(req.params.orderid);
  var logs = await OrderProductLog.find({ orderId: order.id, productId: req.params.idx }).exec();
  return res.status(200).json({ logs: logs });
});

module.exports = router;