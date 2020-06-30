
const mongoose = require('mongoose');
const Config = mongoose.model('Config');

module.exports.getVat = async () => {
    let config = await Config.findOne({ id: 'vat' }).exec()
    if (!config) { throw new Error("No vat provided in database") }
    return config;
}