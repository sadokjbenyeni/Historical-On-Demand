const config = require('../config/config.js');
const domain = config.domain();
const SMTP = config.smtpconf();
const nodemailer = require("nodemailer");

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

  this.newOrder = function(email)
  {
      let mailOptions = {
          from: 'no-reply@quanthouse.com',
          to: email,
          subject: config.environment() + 'Order # ' + this.order.id + ' Confirmation',
          text: `Hello,
      
      
          Thank you for choosing the QH's Historical Data On-Demand product.
          You Order # `+ this.order.id + ` has been received on ` + this.order.paymentdate.substring(0, 10) + " " + this.order.paymentdate.substring(11, 19) + ` CET and is currently pending validation.
          For any further information about your order, please use the following link: `+ domain + `/order/history/` + this.order._id + `
      
          
          Thank you,
          Quanthouse`,
      
          html: `Hello,<br><br>
          Thank you for choosing the QH's Historical Data On-Demand product.<br>
          You Order <b># `+ this.order.id + `</b> has been received on ` + this.order.paymentdate.substring(0, 10) + " " + this.order.paymentdate.substring(11, 19) + ` CET and is currently pending validation.<br>
          For any further information about your order, please use the following link: <a href="`+ domain + `/order/history` + this.order._id + `"> Click here</a>
          <br><br>
          <b>Thank you,<br>Quanthouse</b>`
        };
        smtpTransport.sendMail(mailOptions, (error, info) => {
          this.logger.debug({ message: JSON.stringify(info), className: 'Order Mailer Service'});
          if (error) {
            this.logger.error({ message: err.message, className: 'Order Mailer Service', error: error });
            this.logger.error({ message: JSON.stringify(error), className:'Order Mailer Service'});
            return false;
          }
          return true;
        });
  }    

  this.newOrderHod = function(email, firstname, lastname, service, eids, total, submission) {
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: email,
      subject: config.environment() + 'QH Histo On-Demand / NEW Order',
      text: `
      New Client Order has been received and it is currently pending approval from QH ` + service + ` department.
      Order characteristics:
        - Client Name : `+ firstname + ` ` + lastname + `
        - Order ID : `+ this.order.idCmd + `
        - Submission date : `+ submission.substring(0, 10) + " " + submission.substring(11, 19) + `
        - List of EIDs : `+ eids + `
        - TOTAL Order amount (including taxes) : `+ total,
  
      html: `
      New Client Order has been received and it is currently pending approval from QH ` + service + ` department.<br><br>
      Order characteristics:<br>
      <ul>
        <li>Client Name : `+ firstname + ` ` + lastname + `</li>
        <li>Order ID : `+ idCmd + `</li>
        <li>Submission date : `+ date.substring(0, 10) + " " + date.substring(11, 19) + `</li>
        <li>List of EIDs : `+ eid + `</li>
        <li>TOTAL Order amount (including taxes) : `+ total + `</li>
      </ul>`
    };
    smtpTransport.sendMail(mailOptions, (error, info) => {
      this.logger.debug({ message: JSON.stringify(info), className: 'Order Mailer Service'});
      if (error) {
        this.logger.error({ className: 'Order Mailer Service' });
        this.logger.error({ message: JSON.stringify(error), className:'Order Mailer Service'});
        return false;
      }
      return true;
    });
  } 
}