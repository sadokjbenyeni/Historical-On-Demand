const router = require('express').Router();
const nodemailer = require("nodemailer");
const config = require('../../config/config.js');
const domain = config.domain();
const SMTP = config.smtpconf();
const mongoose = require('mongoose');
const Config = mongoose.model('Config');
const User = mongoose.model('User');
const UserMailService = require('../../service/userMailerService');
const OrderMailService = require('../../service/orderMailerService');

const smtpTransport = nodemailer.createTransport({
  host: SMTP.host,
  port: SMTP.port,
  secure: SMTP.secure,
  // auth: {
  //     user: SMTP.user,
  //     pass: SMTP.pass
  // },
  tls: SMTP.tls,
  debug: SMTP.debug
});

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
    req.logger.error({ message: error.message, className: 'Mailer API', error: error });
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
    return res.status(501).json({ mail: false });
  }
});

router.post('/newOrderHoD', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] QH Histo On-Demand / NEW Order',
    text: `
    New Client Order has been received and it is currently pending approval from QH ` + req.body.service + ` department.
    Order characteristics:
      - Client Name : `+ req.body.firstname + ` ` + req.body.lastname + `
      - Order ID : `+ req.body.idCmd + `
      - Submission date : `+ req.body.date.substring(0, 10) + " " + req.body.date.substring(11, 19) + `
      - List of EIDs : `+ req.body.eid + `
      - TOTAL Order amount (including taxes) : `+ req.body.total,

    html: `
    New Client Order has been received and it is currently pending approval from QH ` + req.body.service + ` department.<br><br>
    Order characteristics:<br>
    <ul>
      <li>Client Name : `+ req.body.firstname + ` ` + req.body.lastname + `</li>
      <li>Order ID : `+ req.body.idCmd + `</li>
      <li>Submission date : `+ req.body.date.substring(0, 10) + " " + req.body.date.substring(11, 19) + `</li>
      <li>List of EIDs : `+ req.body.eid + `</li>
      <li>TOTAL Order amount (including taxes) : `+ req.body.total + `</li>
    </ul>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/reminder', async (req, res, next) => { // géré par un CRON
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Pending Order # ' + req.body.idCmd,
    text: `Hello,

    You Order # `+ req.body.idCmd + ` received on ` + req.body.logsPayment + ` CET is currently pending completion of the billing process.
    To complete the billing process, please use the following link: `+ domain + `order/history/` + req.body.token + `
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    You Order # `+ req.body.idCmd + ` received on ` + req.body.logsPayment + ` CET is currently pending completion of the billing process.<br>
    To complete the billing process, please use the following link: <a href="`+ domain + `order/history/` + req.body.token + `">click here</a>
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/orderValidated', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order # ' + req.body.idCmd + ' Validation',
    text: `Hello,

    You Order # `+ req.body.idCmd + ` has been validated.
    You will receive shortly an email notification with all relevant information allowing you to access your data.
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    You Order <b># `+ req.body.idCmd + `</b> has been validated.<br>
    You will receive shortly an email notification with all relevant information allowing you to access your data.
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/orderFailedJob', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order #' + req.body.idCmd.split('-')[0] + ' execution failure',
    text: `Hello,

    Client Order # `+ req.body.idCmd.split('-')[0] + ` -> ` + req.body.idCmd + ` execution has failed with the following error:
    
    Date : `+ req.body.date + ` 
    Description : 
    `+ req.body.description + `
    
    Additional context information :
    Logs :
    `+ req.body.logs + `
    
    
    This is an automated email, sent by the HoD Web Portal`,

    html: `Hello,<br><br>
    Client Order <b># `+ req.body.idCmd.split('-')[0] + ` -> ` + req.body.idCmd + `</b> execution has failed with the following error:<br>
    <br>
    Date : `+ req.body.date + ` <br>
    Description : <br>
    `+ req.body.description + `
    <br>
    Additional context information :<br>
    Logs :<br>
    `+ req.body.logs + `
    <br>
    <br>
    This is an automated email, sent by the HoD Web Portal`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/orderFailed', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order # ' + req.body.idCmd + ' execution issue',
    text: `Hello,

    An issue has been encountered executing your Order # `+ req.body.idCmd + ` Our teams are working actively to resolve the issue as quickly as possible.
    
    Please contact your local support should you need any further information.
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    An issue has been encountered executing your Order <b># `+ req.body.idCmd + `</b> Our teams are working actively to resolve the issue as quickly as possible.<br><br>
    Please contact your local support should you need any further information.
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/orderExecuted', async (req, res, next) => {
  Config.findOne({
    id: "downloadSetting"
  })
    .then(result => {
      let mailOptions = {
        from: 'no-reply@quanthouse.com',
        to: req.body.email,
        subject: '[UAT] Order # ' + req.body.idCmd + ' Execution',
        text: `Hello,
  
      You Order # `+ req.body.idCmd + ` has been executed.
      You can access your data via the Order History page of your account : `+ domain + `/order/history/
  
      Your data will be available for download during :
      - `+ result.periodOneOff + ` days, for One-Time delivery items
      - `+ result.periodSubscription + ` days, for Recurrent delivery items (Subscription)
      
      Thank you,
      Quanthouse`,

        html: `Hello,<br><br>
      You Order # `+ req.body.idCmd + ` has been executed.<br>
      You can access your data via the Order History page of your account : <a href="`+ domain + `/order/history/"> Click here</a>
      <br><br>
      Your data will be available for download during :<br>
      - `+ result.periodOneOff + ` days, for One-Time delivery items<br>
      - `+ result.periodSubscription + ` days, for Recurrent delivery items (Subscription)
      <br><br>
      <b>Thank you,<br>Quanthouse</b>`
      };
      smtpTransport.sendMail(mailOptions, (error, info) => {
        if (error) {
          req.logger.error({ message: err.message, className: 'Mailer API', error: error });
          return console.log(error);
        }
        return res.status(200).json({ mail: true });
      });
    });
});

router.post('/orderRejected', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order # ' + req.body.idCmd + ' rejection',
    text: `Hello,

    Your Order # `+ req.body.idCmd + ` has been rejected with the following reason:
    `+ req.body.reason + `

    Please contact your local support should you need any further information.

    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    Your Order <b># `+ req.body.idCmd + `</b> has been rejected with the following reason:<br>
    `+ req.body.reason + `<br><br>
    Please contact your local support should you need any further information.<br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/orderCancelled', async (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order # ' + req.body.idCmd + ' cancellation',
    text: `Hello,

    Your Order # `+ req.body.idCmd + ` has been cancelled.

    Please contact your local support should you need any further information.

    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    Your Order <b># `+ req.body.idCmd + `</b> has been rejected with the following reason:<br><br>
    Please contact your local support should you need any further information.<br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

module.exports = router;
