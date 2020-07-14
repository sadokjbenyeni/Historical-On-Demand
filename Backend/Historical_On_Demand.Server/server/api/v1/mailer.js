const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const UserMailService = require('../../service/userMailerService');
const OrderMailService = require('../../service/orderMailerService');


router.post('/inscription', async (req, res, next) => {
  var user = await User.findOne({ token: req.body.token }).exec();
  if(!user)
  {
    return res.status(403).json({ error: "User not found" });
  }  
  try {
    var mailer = new UserMailService(req.logger, user);
    mailer.SendMailForInscription();
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API' });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/activation', async (req, res, next) => {
  var user = await User.findOne({ token: req.body.token }).exec();
  if(!user)
  {
    return res.status(403).json({ error: "User not found" });
  }  
  try {
    var mailer = new UserMailService(req.logger, user);
    mailer.activated();
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/activated', async (req, res, next) => {
  var user = await User.findOne({ token: req.body.token }).exec();
  if(!user)
  {
    return res.status(403).json({ error: "User not found" });
  }  
  try {
    var mailer = new UserMailService(req.logger, user);
    mailer.activated();
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/mdp', async (req, res, next) => {
  var user = await User.findOne({ email: req.body.email }).exec();
  if(!user)
  {
    return res.status(403).json({ error: "User not found, please contact support with '" + req.headers.loggerToken + "'" });
  }  
  try {
    var mailer = new UserMailService(req.logger, user);
    mailer.RenewPassword();
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/newOrder', async (req, res, next) => {
  var order = await Order.findOne({ _id: req.body._id }).exec();
  if(!order)
  {
    return res.status(403).json({ error: "Order not found" });
  }  
  try {
    var mailer = new OrderMailService(req.logger, order);
    mailer.newOrder();
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/newOrderHoD', async (req, res, next) => {
  var order = await Order.findOne({ _id: req.body._id }).exec();
  if(!order)
  {
    return res.status(403).json({ error: "Order not found" });
  }  
  try {
    var mailer = new OrderMailService(req.logger, order);
    mailer.newOrderHod(req.body.email, req.body.firstname, req.body.lastname, req.body.service, req.body.eid, req.body.total, req.body.date);
    return res.status(200).json({ mail: true });
  }
  catch(error) {
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
    req.logger.error({ message: JSON.stringify(error), className:'Mailer API'});
    return res.status(501).json({ mail: false });
  }
});

router.post('/reminder', async (req, res, next) => { // géré par un CRON
  try {
    var mailer = new OrderMailService(req.logger, { id: c.id_cmd.split("-")[0] });
    mailer.orderValidated({ email: req.body.email, logsPayment: req.body.logsPayment, token: req.body.token });
  }
  catch(error){
    req.logger.error({message: "Error during mailing." + error.message, className: 'Mailer API'});
    return res.status(500).json({reason: "An error has been thrown during the mailing, please contact support with '"+ req.headers.loggerToken + "'", mail:false});
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderValidated', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: c.id_cmd.split("-")[0] });
    mailer.orderValidated({ email: req.body.email });
  }
  catch(error){
    req.logger.error({message: "Error during mailing." + error.message, className: 'Mailer API'});
    return res.status(500).json({reason: "An error has been thrown during the mailing, please contact support with '"+ req.headers.loggerToken + "'", mail:false});
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderFailedJob', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.id_cmd });
    mailer.orderFailedJob({
      idCmd: req.body.id_cmd,
      email: req.body.email,
      description: req.body.state_description,
      date: new Date(),
      logs: req.body.log
    });
  }
  catch(error){
    req.logger.error({message: "Error during mailing." + error.message, className: 'Mailer API'});
    return res.status(500).json({reason: "An error has been thrown during the mailing, please contact support with '"+ req.headers.loggerToken + "'", mail:false});
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderFailed', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.id_cmd });
    mailer.orderFailed({
      idCmd: req.body.id_cmd,
      email: req.body.email
    });
  }
  catch(error){
    req.logger.error({message: "Error during mailing." + error.message, className: 'Mailer API'});
    return res.status(500).json({reason: "An error has been thrown during the mailing, please contact support with '"+ req.headers.loggerToken + "'", mail:false});
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderExecuted', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.idCmd });
    mailer.orderExecuted({ idCmd: req.body.id, email: req.body.email });
  }
  catch (error) {
    req.logger.error({ message: "Error during mailing." + error.message, className: 'Mailer API' });
    return res.status(500).json({ reason: "An error has been thrown during the mailing, please contact support with '" + req.headers.loggerToken + "'", mail: false });
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderRejected', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.idCmd });
    mailer.orderExecuted({ email: req.body.email, reason: req.body.reason });
  }
  catch (error) {
    req.logger.error({ message: "Error during mailing." + error.message, className: 'Mailer API' });
    return res.status(500).json({ reason: "An error has been thrown during the mailing, please contact support with '" + req.headers.loggerToken + "'", mail: false });
  }
  return res.status(200).json({ mail: true });
});

router.post('/orderCancelled', async (req, res, next) => {
  try {
    var mailer = new OrderMailService(req.logger, { id: req.body.idCmd });
    mailer.orderCancelled({ email: req.body.email });
  }
  catch (error) {
    req.logger.error({ message: "Error during mailing." + error.message, className: 'Mailer API' });
    return res.status(500).json({ reason: "An error has been thrown during the mailing, please contact support with '" + req.headers.loggerToken + "'", mail: false });
  }
  return res.status(200).json({ mail: true });
});

module.exports = router;
