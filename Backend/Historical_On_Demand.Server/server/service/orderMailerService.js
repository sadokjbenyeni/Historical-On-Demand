//const config = require('../config/config.js');
const domain = global.environment.domain;
const SMTP = global.environment.smtpconf;
const environment = global.environment.environment;
const nodemailer = require("nodemailer");
const loggerFactory = require('../../logger');

const smtpTransport = nodemailer.createTransport({
  host: SMTP.host,
  port: SMTP.port,
  secure: SMTP.secure,
  tls: SMTP.tls,
  debug: SMTP.debug
});

module.exports = function (logger, order) {
  this.logger = logger;
  this.order = order;

  this.newOrder = async function (email) {
    let dateTime = this.order.submissionDate;
    if (this.order.paymentdate) {
      dateTime = this.order.paymentdate;
    }
    var optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    let date = new Intl.DateTimeFormat("en-gb", optionsDate).format(dateTime);
    var optionsTime = { hour: "numeric", minute: "numeric", hour12: true };
    let time = new Intl.DateTimeFormat("en-gb", optionsTime).format(dateTime);

    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: email,
      subject: environment + 'Order # ' + this.order.id + ' Confirmation',
      text: `Hello,
    
    
        Thank you for choosing the QH's Historical Data On-Demand product.
        You Order # ${this.order.id} has been received on ${date} ${time} CET and is currently pending validation.
        For any further information about your order, please use the following link: ${domain}/order/history/${this.order._id}    
        
        Thank you,
        Quanthouse`,

      html: `Hello,<br><br>
        Thank you for choosing the QH's Historical Data On-Demand product.<br>
        You Order <b>#${this.order.id}</b> has been received on ${date} ${time} CET and is currently pending validation.<br>
        For any further information about your order, please use the following link: <a href="${domain}/order/history/${this.order._id}> Click here</a>
        <br><br>
        <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      this.logger.info("Sending email for newOrder");
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.newOrderHod = async function (email, service, total) {
    let eids = this.order.products.map(product => product.eid);
    let firstname = this.order.firstname;
    let lastname = this.order.lastname;
    var optionsDate = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
    let date = new Intl.DateTimeFormat("en-gb", optionsDate).format(this.order.submissionDate);
    var optionsTime = { hour: "numeric", minute: "numeric", hour12: true };
    let time = new Intl.DateTimeFormat("en-gb", optionsTime).format(this.order.submissionDate);
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: email,
      subject: environment + 'QH Histo On-Demand / NEW Order',
      text: `
      New Client Order has been received and it is currently pending approval from QH ${service} department.
      Order characteristics:
        - Client Name: ${firstname} ${lastname}
        - Order ID: ${this.order.id}
        - Submission date: ${date} ${time}
        - List of EIDs: ${eids}
        - TOTAL Order amount (including taxes): ${total}

      html: 
      New Client Order has been received and it is currently pending approval from QH ` + service + ` department.<br><br>
      Order characteristics:<br>
      <ul>
        <li>Client Name: ${firstname} ${lastname}</li>
        <li>Order ID: ${this.order.id}</li>
        <li>Submission date: ${date} ${time}</li>
        <li>List of EIDs: ${eids}</li>
        <li>TOTAL Order amount (including taxes): ${total}</li>
      </ul>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderValidated = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id} Validation`,
      text: `Hello,
  
      You Order # ${this.order.id} has been validated.
      You will receive shortly an email notification with all relevant information allowing you to access your data.
      
      Thank you,
      Quanthouse`,

      html: `Hello,<br><br>
      You Order <b># ${this.order.id}</b> has been validated.<br>
      You will receive shortly an email notification with all relevant information allowing you to access your data.
      <br><br>
      <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderRejected = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id} rejection`,
      text: `Hello,
  
      Your Order # ${this.order.id} has been rejected with the following reason:
      ${corp.reason}
  
      Please contact your local support should you need any further information.
  
      Thank you,
      Quanthouse`,

      html: `Hello,<br><br>
      Your Order <b>#${this.order.id}</b> has been rejected with the following reason:<br>
      ${corp.reason}<br><br>
      Please contact your local support should you need any further information.<br><br>
      <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderCancelled = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id} cancellation`,
      text: `Hello,
  
      Your Order #${this.order.id} has been cancelled.
  
      Please contact your local support should you need any further information.
  
      Thank you,
      Quanthouse`,

      html: `Hello,<br><br>
      Your Order <b>#${this.order.id}</b> has been rejected with the following reason:<br><br>
      Please contact your local support should you need any further information.<br><br>
      <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderExecuted = async function (corp) {
    var downloadSetting = await global.environment.findOne({ id: "downloadSetting" }).exec();
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id} Execution`,
      text: `Hello,

    You Order # ${this.order.id} has been executed.
    You can access your data via the Order History page of your account : ${domain}/order/history/

    Your data will be available for download during :
    - ${downloadSetting.periodOneOff} days, for One-Time delivery items
    - ${downloadSetting.periodSubscription} days, for Recurrent delivery items (Subscription)
    
    Thank you,
    Quanthouse`,

      html: `Hello,<br><br>
    You Order # ${this.order.id} has been executed.<br>
    You can access your data via the Order History page of your account : <a href="${domain}/order/history/"> Click here</a>
    <br><br>
    Your data will be available for download during :<br>
    - ${downloadSetting.periodOneOff} days, for One-Time delivery items<br>
    - ${downloadSetting.periodSubscription} days, for Recurrent delivery items (Subscription)
    <br><br>
    <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderFailedJob = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id.split('-')[0]} execution failure`,
      text: `Hello,
  
      Client Order # ${this.order.id.split('-')[0]} -> ${this.order.id} execution has failed with the following error:
      
      Date : ${corp.date} 
      Description : 
        ${corp.description}
      
      Additional context information :
      Logs :
        ${corp.logs}
      
      This is an automated email, sent by the HoD Web Portal`,

      html: `Hello,<br><br>
      Client Order <b># ${this.order.id.split('-')[0]} -> ${this.order.id} </b> execution has failed with the following error:<br>
      <br>
      Date : ${corp.date} <br>
      Description : <br>
         ${corp.description}
      <br>
      Additional context information :<br>
      Logs :<br>
         ${corp.logs}
      <br>
      <br>
      This is an automated email, sent by the HoD Web Portal`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.orderFailed = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: `${environment}Order # ${this.order.id} execution issue`,
      text: `Hello,
  
      An issue has been encountered executing your Order # ${this.order.id} Our teams are working actively to resolve the issue as quickly as possible.
      
      Please contact your local support should you need any further information.
      
      Thank you,
      Quanthouse`,

      html: `Hello,<br><br>
      An issue has been encountered executing your Order <b># {his.order.id} </b> Our teams are working actively to resolve the issue as quickly as possible.<br><br>
      Please contact your local support should you need any further information.
      <br><br>
      <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }

  this.reminder = async function (corp) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: corp.email,
      subject: environment + 'Pending Order # ' + this.order.id,
      text: `Hello,
  
      You Order # ${this.order.id} received on ${corp.logsPayment} CET is currently pending completion of the billing process.
      To complete the billing process, please use the following link: ${domain} order/history/${corp.token}
      
      Thank you,
      Quanthouse`,

      html: `Hello,<br><br>
      You Order # ${this.order.id} received on ${corp.logsPayment} CET is currently pending completion of the billing process.<br>
      To complete the billing process, please use the following link: <a href="${domain}order/history/${corp.token}">click here</a>
      <br><br>
      <b>Thank you,<br>Quanthouse</b>`
    };
    try {
      var info = await smtpTransport.sendMail(mailOptions);
    }
    catch (error) {
      this.logger.error({ message: error.message, className: 'Order Mailer Service' });
      this.logger.error({ message: error.stack, className: 'Order Mailer Service' });
      return console.log(error);
    }
  }
}