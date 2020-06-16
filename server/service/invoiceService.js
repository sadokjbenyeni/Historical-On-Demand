const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')
const invoiceDirectory = require('../config/config.js').InvoiceDirectory();

const http = require('http');

module.exports.insertInvoice = async (orderId, invoiceId, userId) => {
    var invoice = new Invoice({ orderId: orderId, invoiceId: invoiceId, userId: userId, path: invoiceDirectory + invoiceId + '.pdf' });
    invoice.save(function (error) {
        if (error) return handleError(error);
    });
}

