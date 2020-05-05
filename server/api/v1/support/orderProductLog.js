const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const OrderProductLog = mongoose.model('OrderProductLog');


const OrderProductLogService = require('../../../service/orderProductLogService');

router.get('/:orderid', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  User.findOne({ token: req.headers.authorization }, { _id: true })
    .then(result => {
      if(result)
      {
        OrderProductLog.find({ orderId: req.params.orderId })
        .then((logs) => {
          return res.status(200).json({ logs: logs });
        });
      }
      else{        
        let token = req.headers.loggerToken;
        console.warn('['+token+'][Security] Token not found');
        return res.status(404);
      }
    });
});

router.get('/:orderid/:idx', (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  User.findOne({ token: req.headers.authorization }, { _id: true })
    .then(result => {
      if(result)
      {
        OrderProductLog.find({ orderId: req.params.orderId, productId: req.params.idx })
        .then((logs) => {
          return res.status(200).json({ logs: logs });
        });
      }
      else{
        let token = req.headers.loggerToken;
        console.warn('['+token+'][Security] Token not found');
        return res.status(404);
      }
    });
});

module.exports = router;