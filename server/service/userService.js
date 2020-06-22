const mongoose = require('mongoose');
const Users = mongoose.model('User');

module.exports.GetUserByToken = async (token) => {
    User = await Users.findOne({ token: token }).exec();
    return User;
}
module.exports.UpdateUserDefaultBillingInfo = async (token, vat, address, city, country, postalCode) => {
    const res = await Users.findOneAndUpdate({ token: token }, {
        $set: {
            countryBilling: country,
            postalCodeBilling: postalCode,
            vat: vat,
            cityBilling: city,
            addressBilling: address,
        }
    }).exec()
    if (res.error)
        throw new error("User not found ");
    return true


}
module.exports.UpdateUserDefaultCurrency = async (token, currency) => {
    const res = await Users.findOneAndUpdate({ token: token }, {
        $set: {
            currency: currency,
        }
    }).exec();
    if (res.error) {
        throw new error("User not found ");
    }
    return true
}
