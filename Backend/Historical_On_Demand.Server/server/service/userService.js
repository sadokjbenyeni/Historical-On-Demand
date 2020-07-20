const mongoose = require("mongoose");
const { options } = require("../api/v1/administrator/user");
const Users = mongoose.model("User");

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

module.exports.checkPasswordIsValidAndUpdateEmailAdress = async (
  userId,
  password,
  email
) => {
  user = await Users.findOneAndUpdate(
    {
      _id: userId,
      password: password,
    },
    {
      $set: {
        email: email,
      },
    }
  ).exec();
  if (user) {
    return true;
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
    throw new error("Update failed !");
  }
};
