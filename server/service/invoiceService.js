const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')
const invoiceDirectory = require('../config/config.js').InvoiceDirectory();

const http = require('http');

module.exports = function () {
    this.insertInvoice = async function (orderId, invoiceId) {
        await Invoice.updateOne({ orderId: orderId }, { set: { invoiceId: invoiceId, path: invoiceDirectory + invoiceId + '.pdf' } }).exec();
    }

    this.getInvoicePath = async function (orderId) {
        var invoice = await Invoice.findOne({ orderId: orderId }).exec();
        if (!invoice) {
            return orderId;
        }
        else {
            invoicePath = invoice.path;
            return invoicePath;
        }
    }
}