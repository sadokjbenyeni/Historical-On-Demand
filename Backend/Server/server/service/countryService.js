
const mongoose = require('mongoose');
const Countries = mongoose.model('Countrie');

module.exports.isUe = async (countryid) => {
    let isUe = await Countries.findOne({ id: countryid }, { ue: true, _id: false }).exec()
    if (!isUe) { throw new Error("Country not found") }
    return isUe;
}