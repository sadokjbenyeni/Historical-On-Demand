const mongoose = require('mongoose')

const Sale = mongoose.model('Sale')

module.exports.GetAllSales = () => {
    return Sale.find({}, { _id: false })
}