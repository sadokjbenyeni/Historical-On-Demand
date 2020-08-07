const mongoose = require("mongoose");
const { options } = require("../api/v1/administrator/user");
const Users = mongoose.model("User");
const UserMailService = require("../service/userMailerService");
const jwtService = require("../service/jwtService");
module.exports.getUserById = async (userId, options = { password: false }) => {
  const user = await Users.findOne({ _id: userId }, options).exec();
  return user;
};
module.exports.UpdateUserDefaultBillingInfo = async (
  userId,
  vat,
  address,
  city,
  country,
  postalCode
) => {
  const res = await Users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        countryBilling: country,
        postalCodeBilling: postalCode,
        vat: vat,
        cityBilling: city,
        addressBilling: address,
      },
    }
  ).exec();
  if (res.error) throw new error("User not found ");
  return true;
};
module.exports.UpdateUserDefaultCurrency = async (userId, currency) => {
  const res = await Users.findOneAndUpdate(
    { _id: userId },
    {
      $set: {
        currency: currency,
      },
    }
  ).exec();
  if (res.error) {
    throw new error("User not found ");
  }
  return true;
};

module.exports.UpdateUser = async (user) => {
  const userToUpdate = await Users.updateOne(
    { _id: user._id },
    {
      $set: user,
    }
  ).exec();
  if (userToUpdate.error) {
    throw new error("Update failed ");
  }
};

module.exports.SendMailForEmailUpdateVerification = async (
  logger,
  userId,
  email
) => {
  const user = await this.getUserById(userId);
  if (user) {
    const token = jwtService.createTokentoUpdateUserMail({
      id: user._id,
      email: email,
    });
    var mailer = new UserMailService(logger, user);
    await mailer.ConfirmUpdateEmail(token);
  } else {
    throw new Error("User not found ");
  }
};
module.exports.UpdateEmailAdress = async (userId, email) => {
  user = await Users.findOneAndUpdate(
    {
      _id: userId,
    },
    {
      $set: {
        email: email,
      },
    },
    {
      new: true,
    }
  ).exec();
  if (user) {
    return user;
  } else {
    throw new error("Update failed ");
  }
};

module.exports.checkEmailIfExist = async (email) => {
  const user = await Users.findOne({ email: email }).exec();
  if (user) {
    return true;
  }
  return false;
};

module.exports.SendMailForResetPassword = async (logger, email) => {
  if (email) {
    const user = await Users.findOne({ email: email }).exec();
    if (user) {
      const token = jwtService.createTokentoResetPassword({
        email: email,
      });
      var mailer = new UserMailService(logger, user);
      await mailer.RenewPassword(token);
    } else {
      throw new Error("User not found");
    }
  } else {
    throw new Error("Email Adress not valid ");
  }
};

module.exports.updateUserPassword = async (
  userId,
  oldPassword,
  newPassword
) => {
  user = await Users.findOneAndUpdate(
    {
      _id: userId,
      password: oldPassword,
    },
    {
      $set: {
        password: newPassword,
      },
    }
  ).exec();

  if (user) {
    return true;
  } else {
    throw new Error("Update failed, please check your password");
  }
};

module.exports.resetPassword = async (email, password) => {
  user = await Users.findOneAndUpdate(
    {
      email: email,
    },
    {
      $set: {
        password: password,
      },
    }
  ).exec();

  if (user) {
    return true;
  } else {
    throw new Error("Update failed, please check your password");
  }
};
