const router = require('express').Router();
const nodemailer = require("nodemailer");
const config = require('../../config/config.js');
const domain = config.domain();
const SMTP = config.smtpconf();
const mongoose = require('mongoose');
const Config = mongoose.model('Config');


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

router.post('/inscription', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email, //req.body.user,
    subject: '[UAT] Confirm your email',
    text: `Hello,

    
    To validate your email address and activate your account, please click on the following link:
    `+ domain + `/activation/` + req.body.token +
      `If clicking the above link does not work, you can copy and paste the URL in a new browser window.

    If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.


    The Quanthouse team`,

    html: `Hello,<br><br>
    To validate your email address and activate your account, please click on the following link:
    <a href="`+ domain + `/activation/` + req.body.token + `">Activation of the HistodataWeb account</a><br>
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br><br>
    If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
    <br><br>
    <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});
router.post('/activation', (req, res, next) => {
  let login = '';
  let password = '';
  let link = '';
  // if(URLS.indexOf(req.headers.referer) !== -1){
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email, //req.body.user,
    subject: '[UAT] Account Activation',
    text: `Hello,
      Thank you for choosing QH’s On Demand Historical Data product!
      Your account has been successfully created. Below are your login credentials.
      Login: ` + login + `
      Password: ` + password + `
      To manage your profile please go to: ` + link + `

      The Quanthouse team`,

    html: `Hello,<br><br>
      Thank you for choosing QH’s On Demand Historical Data product!
      Your account has been successfully created. Below are your login credentials.
      Login: ` + login + `<br>
      Password: ` + password + `<br><br>
      To manage your profile please go to: ` + link + `
      <br><br>
      <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
  // }
  // else{
  //     return res.sendStatus(404);
  // }
});

router.post('/activated', (req, res, next) => {
  let login = '';
  let password = '';
  let link = '';
  // if(URLS.indexOf(req.headers.referer) !== -1){
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email, //req.body.user,
    subject: '[UAT] Your Account has been validated',
    text: `Hello,
      Thank you for choosing QH’s On Demand Historical Data product!
      Your account has been successfully created. Below are your login credentials.
      Login: ` + login + `
      Password: ` + password + `
      To manage your profile please go to: ` + link + `

      The Quanthouse team`,

    html: `Hello,<br><br>
      Thank you for choosing QH’s On Demand Historical Data product!
      Your account has been successfully created. Below are your login credentials.
      Login: ` + login + `<br>
      Password: ` + password + `<br><br>
      To manage your profile please go to: ` + link + `
      <br><br>
      <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
  // }
  // else{
  //     return res.sendStatus(404);
  // }
});

router.post('/mdp', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Password Initialization',
    text: `Hello,

    To reinitialize your password, please click on the following link: `+ domain + `/mdp/` + req.body.token + `
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.
    If you have received this email by error, you do not need to take any action. Your password will remain unchanged.

    The Quanthouse team`,

    html: `Hello,<br><br>
    To reinitialize your password, please click on the following link: `+ domain + `/mdp/` + req.body.token + `<br>
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br>
    If you have received this email by error, you do not need to take any action. Your password will remain unchanged.<br><br>
    <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      req.logger.error({ message: err.message, className: 'Mailer API', error: error });
      return console.log(error);
    }
    return res.status(200).json({ mail: true });
  });
});

router.post('/newOrder', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: '[UAT] Order # ' + req.body.idCmd + ' Confirmation',
    text: `Hello,


    Thank you for choosing the QH's Historical Data On-Demand product.
    You Order # `+ req.body.idCmd + ` has been received on ` + req.body.paymentdate.substring(0, 10) + " " + req.body.paymentdate.substring(11, 19) + ` CET and is currently pending validation.
    For any further information about your order, please use the following link: `+ domain + `/order/history/` + req.body.idCmd + `

    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    Thank you for choosing the QH's Historical Data On-Demand product.<br>
    You Order <b># `+ req.body.idCmd + `</b> has been received on ` + req.body.paymentdate.substring(0, 10) + " " + req.body.paymentdate.substring(11, 19) + ` CET and is currently pending validation.<br>
    For any further information about your order, please use the following link: <a href="`+ domain + `/order/history` + req.body._id + `"> Click here</a>
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

router.post('/newOrderHoD', (req, res, next) => {
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

router.post('/reminder', (req, res, next) => { // géré par un CRON
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

router.post('/orderValidated', (req, res, next) => {
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

router.post('/orderFailedJob', (req, res, next) => {
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

router.post('/orderFailed', (req, res, next) => {
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

router.post('/orderExecuted', (req, res, next) => {
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

router.post('/orderRejected', (req, res, next) => {
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

router.post('/orderCancelled', (req, res, next) => {
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
