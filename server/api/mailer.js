const app = require('express')();
const router = require('express').Router();
const nodemailer = require("nodemailer");
const config = require('../config/config.js');
const domain = config.domain();
const admin = config.admin();
const URLS = config.config();
const SMTP = config.smtpconf();

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
    subject: 'Confirm your email',
    text: `Hello,

    
    To validate your email address and activate your account, please click on the following link:
    `+ domain + `/activation/` + req.body.token +
    `If clicking the above link does not work, you can copy and paste the URL in a new browser window.

    If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.


    The Quanthouse team`,

    html: `Hello,<br><br>
    To validate your email address and activate your account, please click on the following link:
    <a href="`+ domain + `/activation/`+ req.body.token +`">Activation of the HistodataWeb account</a><br>
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br><br>
    If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
    <br><br>
    <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
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
      subject: 'Account Activation',
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
        return console.log(error);
      }
      return res.json({mail:true}).statusCode(200);
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
      subject: 'Your Account has been validated',
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
        return console.log(error);
      }
      return res.json({mail:true}).statusCode(200);
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
    subject: 'Password Initialization',
    text: `Hello,

    To reinitialize your password, please click on the following link: `+ domain + `/mdp/`+ req.body.token +`
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.
    If you have received this email by error, you do not need to take any action. Your password will remain unchanged.

    The Quanthouse team`,

    html: `Hello,<br><br>
    To reinitialize your password, please click on the following link: `+ domain + `/mdp/`+ req.body.token +`<br>
    If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br>
    If you have received this email by error, you do not need to take any action. Your password will remain unchanged.<br><br>
    <b>The Quanthouse team</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
  });
});

router.post('/newOrder', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: 'Order # ' + req.body.idCmd + ' confirmation',
    text: `Hello,


    Thank you for choosing the QH's Historical Data On-Demand product.<br>
    You Order # `+ req.body.idCmd +` has been received on ` + req.body.paymentdate.substring(0, 10) + " " + req.body.paymentdate.substring(11, 19) + ` CET and is currently pending validation by the QH ` + req.body.service + ` department.
    For any further information about your order, please use the following link: `+ domain + `/order/history

    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    Thank you for choosing the QH's Historical Data On-Demand product.<br>
    You Order <b># `+ req.body.idCmd +`</b> has been received on ` + req.body.paymentdate.substring(0, 10) + " " + req.body.paymentdate.substring(11, 19) + ` CET and is currently pending validation by the <b>QH ` + req.body.service + ` department</b>.<br>
    For any further information about your order, please use the following link: <a href="`+ domain + `/order/history"> Click here</a>
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
  });
});

router.post('/reminder', (req, res, next) => { // géré par un CRON
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: 'Pending Order # ' + req.body.idCmd,
    text: `Hello,

    You Order # `+ req.body.idCmd +` received on ` + req.body.logsPayment + ` CET is currently pending completion of the billing process.
    To complete the billing process, please use the following link: `+ domain + `order/history/`+ req.body.token + `
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    You Order # `+ req.body.idCmd +` received on ` + req.body.logsPayment + ` CET is currently pending completion of the billing process.<br>
    To complete the billing process, please use the following link: <a href="`+ domain + `order/history/`+ req.body.token + `">click here</a>
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
  });
});

router.post('/orderValidated', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: 'Order # ' + req.body.idCmd + ' validated',
    text: `Hello,

    You Order # `+ req.body.idCmd +` has been now validated.
    You will receive shortly an email notification with all relevant information allowing you to access your data.
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    You Order <b># `+ req.body.idCmd +`</b> has been now validated.<br>
    You will receive shortly an email notification with all relevant information allowing you to access your data.
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
  });
});

router.post('/orderExecuted', (req, res, next) => {
  let mailOptions = {
    from: 'no-reply@quanthouse.com',
    to: req.body.email,
    subject: 'Order # ' + req.body.idCmd + ' executed',
    text: `Hello,

    You Order # `+ req.body.idCmd +` has been now executed.
    You can also access your data via the Order History page of your account : `+ domain + `/order/history/
    
    Thank you,
    Quanthouse`,

    html: `Hello,<br><br>
    You Order # `+ req.body.idCmd +` has been now executed.<br>
    You can also access your data via the Order History page of your account : <a href="`+ domain + `/order/history/"> Click here</a>
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
  };
  smtpTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    return res.json({mail:true}).statusCode(200);
  });
});


module.exports = router;
