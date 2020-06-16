const router = require('express').Router();
const mongoose = require('mongoose');

const User = mongoose.model('User');
const PdfService = require('../../service/pdfService');

router.post('/', async (req, res) => {
  if (!req.headers.authorization) {
    return res.status(401);
  }
  var authentifiedUser = await User.findOne({ token: req.headers.authorization }, { _id: true }).exec();
  if (!authentifiedUser) {
    req.logger.warn({ message: '[Security] Token not found', className: 'PDF API' });
    return res.status(403).json({ message: "Access denied. Please contact support with identifier: [" + req.headers.loggerToken + "]" });
  }
  try {
    await new PdfService().generateInvoice(order.id, log);
  }
  catch (error) {
    req.logger.error({ error: error, message: error.message, className: "PDF API" });
    return res.status(503).json({ message: "an error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
  }
  return res.status(200).json(order.idCommande);
})

module.exports = router;