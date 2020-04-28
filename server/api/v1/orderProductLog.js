const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');


const OrderProductLogService = require('../../../service/orderProductLogService');

router.get('/:orderid', (req, res) => {
    Order.find({ idUser: req.params.id })
      .then((cmd) => {
        return res.status(200).json({ cmd: cmd });
      });
  });

router.get('/:orderid/:idx', (req, res) => {
    Order.find({ idUser: req.params.id })
      .then((cmd) => {
        return res.status(200).json({ cmd: cmd });
      });
  });