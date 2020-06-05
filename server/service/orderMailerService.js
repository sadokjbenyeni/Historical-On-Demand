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

    this.newOrder = function()
    {
        let mailOptions = {
            from: 'no-reply@quanthouse.com',
            to: req.body.email,
            subject: '[UAT] Order # ' + this.order.id + ' Confirmation',
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
            if (error) {
              req.logger.error({ message: err.message, className: 'Mailer API', error: error });
              throw error;
            }
          });
    }    
}