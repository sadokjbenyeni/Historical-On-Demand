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
