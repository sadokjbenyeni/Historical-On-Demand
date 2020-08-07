//const config = require('../config/config.js');
const domain = global.environment.domain;
const SMTP = global.environment.smtpconf;
const nodemailer = require("nodemailer");

const smtpTransport = nodemailer.createTransport({
  host: SMTP.host,
  port: SMTP.port,
  secure: SMTP.secure,
  tls: SMTP.tls,
  debug: SMTP.debug,
});

module.exports = function (logger, user) {
  this.logger = logger;
  this.user = user;

  this.SendMailForInscription = function () {
    this.logger.debug({
      message: "user: " + JSON.stringify(user),
      className: "UserMailer service",
    });
    let mailOptions = {
      from: "no-reply@quanthouse.com",
      to: this.user.email, //req.body.user,
      subject: global.environment.environment + "Confirm your email",
      text:
        `Hello,
        
            
            To validate your email address and activate your account, please click on the following link:
            ` +
        domain +
        `/activation/` +
        this.user.token +
        `If clicking the above link does not work, you can copy and paste the URL in a new browser window.
        
            If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
        
        
            The Quanthouse team`,

      html:
        `Hello,<br><br>
            To validate your email address and activate your account, please click on the following link:
            <a href="` +
        domain +
        `/activation/` +
        this.user.token +
        `">Activation of the HistodataWeb account</a><br>
            If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br><br>
            If you have received this email by error, you do not need to take any action. The account will not be activated and you will not receive any further emails.
            <br><br>
            <b>The Quanthouse team</b>`,
    };
    this.logger.debug({
      message: "mailOptions: " + JSON.stringify(mailOptions),
      className: "UserMailer service",
    });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({
          message: error.message,
          className: "UserMailer service",
          error: error,
        });
        this.logger.error({
          message: JSON.stringify(error),
          className: "UserMailer service",
        });
        throw error;
      }
    });
  };

  this.activated = function () {
    this.logger.debug({
      message: "user: " + JSON.stringify(user),
      className: "UserMailer service",
    });
    let mailOptions = {
      from: "no-reply@quanthouse.com",
      to: this.user.email, //req.body.user,
      subject: global.environment.environment + "Account Activation",
      text:
        `Hello,
          Thank you for choosing QH’s On Demand Historical Data product!
          Your account has been successfully created. Below are your login credentials.
          Login: ` +
        this.user.email +
        `
          To manage your profile please go to: ` +
        domain +
        `/account

          The Quanthouse team`,
      html:
        `Hello,<br><br>
          Thank you for choosing QH’s On Demand Historical Data product!
          Your account has been successfully created. Below are your login credentials.
          Login: ` +
        this.user.email +
        `<br>
          <a href="` +
        domain +
        `/account">To manage your profile please click here</a><br>
          <br><br>
          <b>The Quanthouse team</b>`,
    };
    this.logger.debug({
      message: "mailOptions: " + JSON.stringify(mailOptions),
      className: "UserMailer service",
    });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({
          message: error.message,
          className: "UserMailer service",
          error: error,
        });
        this.logger.error({
          message: JSON.stringify(error),
          className: "UserMailer service",
        });
        throw error;
      }
    });
  };

  this.RenewPassword = function (token) {
    this.logger.debug({
      message: "user: " + JSON.stringify(user),
      className: "UserMailer service",
    });
    let mailOptions = {
      from: "quanthouse@emailserver.com",
      to: this.user.email,
      subject: global.environment.environment + "Password Initialization",
      text:
        `Hello,
    
        To reinitialize your password, please click on the following link: ` +
        domain +
        `/mdp/` +
        token +
        `
        If clicking the above link does not work, you can copy and paste the URL in a new browser window.
        If you have received this email by error, you do not need to take any action. Your password will remain unchanged.
    
        The Quanthouse team`,

      html:
        `Hello,<br><br>        
        To reinitialize your password, please click on the following link: <a href="` +
        `http://localhost:4200/resetPassword/` +
        token +
        `">Modify password</a><br>
        If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br>
        If you have received this email by error, you do not need to take any action. Your password will remain unchanged.<br><br>
        <b>The Quanthouse team</b>`,
    };
    this.logger.debug({
      message: "mailOptions: " + JSON.stringify(mailOptions),
      className: "UserMailer service",
    });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({
          message: err.message,
          className: "UserMailer service",
          error: error,
        });
        this.logger.error({
          message: JSON.stringify(error),
          className: "UserMailer service",
        });
        throw error;
      }
    });
  };

  this.ConfirmUpdateEmail = function (token) {
    this.logger.debug({
      message: "user: " + JSON.stringify(user),
      className: "UserMailer service",
    });
    let mailOptions = {
      from: "quanthouse@emailserver.com",
      to: this.user.email,
      subject: global.environment.environment + " Update Email",
      html:
        `Hello,<br><br>        
        To update your email, please click on the following link: <a href="` +
        `http://localhost:4200/user/confirmEmailUpdate/` +
        token +
        `">Update Email</a><br>
        <b>Notice</b>: You have 30 minutes to confirm your update before the link expired<br>
        If clicking the above link does not work, you can copy and paste the URL in a new browser window.<br>
        If you have received this email by error, you do not need to take any action. Your email will remain unchanged.<br><br>
        <b>The Quanthouse team</b>`,
    };
    this.logger.debug({
      message: "mailOptions: " + JSON.stringify(mailOptions),
      className: "UserMailer service",
    });
    smtpTransport.sendMail(mailOptions, (error, info) => {
      if (error) {
        this.logger.error({
          message: err.message,
          className: "UserMailer service",
          error: error,
        });
        this.logger.error({
          message: JSON.stringify(error),
          className: "UserMailer service",
        });
        throw error;
      }
    });
  };
};
