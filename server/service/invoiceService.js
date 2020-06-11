const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')
const dnwfile = require('../config/config').dnwfile();
const http = require('http');

module.exports.insertInvoice = (orderId, invoiceId, userId) => {
    var invoice = new Invoice({ orderId: orderId, invoiceId: invoiceId, userId: userId, path: '/mapr/client_invoices/' + invoiceId + '.pdf' });
    invoice.save(function (error) {
        if (error) return handleError(error);
    });
}

