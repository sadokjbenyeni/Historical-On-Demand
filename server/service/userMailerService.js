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

module.exports = function (logger, user) {
  this.logger = logger;
  this.user = user;

  this.SendMailForInscription = function () {
    this.logger.debug({ message: "user: " + JSON.stringify(user), className: "UserMailer service" });
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: this.user.email, //req.body.user,
      subject: config.environment() + 'Confirm your email',
      text: `Hello,
        
            
            To validate your email address and activate your account, please click on the following link:
            `+ domain + `/activation/` + this.user.token +
        `If clicking the above link does not work, you can copy and paste the URL in a new browser window.
        
            If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
        
        
            The Quanthouse team`,

      html: `Hello,<br><br>
            To validate your email address and activate your account, please click on the following link:
            <a href="`+ domain + `/activation/` + this.user.token + `">Activation of the HistodataWeb account</a><br>
            If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br><br>
            If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
            <br><br>
            <b>The Quanthouse team</b>`
    };
    this.logger.debug({ message: "mailOptions: " + JSON.stringify(mailOptions), className: "UserMailer service" });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({ message: err.message, className: 'Mailer API', error: error });
        throw error;
      }
    });
  }

  this.activated = function () {
    this.logger.debug({ message: "user: " + JSON.stringify(user), className: "UserMailer service" });
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: this.user.email, //req.body.user,
      subject: config.environment() + 'Account Activation',
      text: `Hello,
          Thank you for choosing QH’s On Demand Historical Data product!
          Your account has been successfully created. Below are your login credentials.
          Login: ` + this.user.email + `
          To manage your profile please go to: ` + domain + `/account

          The Quanthouse team`,
      html: `Hello,<br><br>
          Thank you for choosing QH’s On Demand Historical Data product!
          Your account has been successfully created. Below are your login credentials.
          Login: ` + this.user.email + `<br>
          <a href="`+ domain + `/account">To manage your profile please click here</a><br>
          <br><br>
          <b>The Quanthouse team</b>`
    };
    this.logger.debug({ message: "mailOptions: " + JSON.stringify(mailOptions), className: "UserMailer service" });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({ message: error.message, className: 'Mailer API', error: error });
        throw error;
      }
    });
  }

  this.RenewPassword = function () {
    this.logger.debug({ message: "user: " + JSON.stringify(user), className: "UserMailer service" });
    let mailOptions = {
      from: 'no-reply@quanthouse.com',
      to: this.user.email,
      subject: config.environment() + 'Password Initialization',
      text: `Hello,
    
        To reinitialize your password, please click on the following link: `+ domain + `/mdp/` + this.user.token + `
        If clicking the above link does not work, you can copy and paste the URL in a new browser window.
        If you have received this email by error, you do not need to take any action. Your password will remain unchanged.
    
        The Quanthouse team`,

      html: `Hello,<br><br>        
        To reinitialize your password, please click on the following link: <a href="`+ domain + `/mdp/` + this.user.token + `">Modify password</a><br>
        If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br>
        If you have received this email by error, you do not need to take any action. Your password will remain unchanged.<br><br>
        <b>The Quanthouse team</b>`
    };
    this.logger.debug({ message: "mailOptions: " + JSON.stringify(mailOptions), className: "UserMailer service" });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({ message: err.message, className: 'Mailer API', error: error });
        throw error;
      }
    });
  }
}