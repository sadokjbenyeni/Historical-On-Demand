const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')

const invoiceDirectory = global.environment.InvoiceDirectory;

const http = require('http');

module.exports = function () {
    this.updateInvoiceInformation = async function (orderId, invoiceId) {
        await Invoice.updateOne({ orderId: orderId }, { $set: { invoiceId: invoiceId, path: `${invoiceDirectory}${invoiceId}.pdf` } }).exec();
    }

    this.updateProFormatInformation = async function (orderId, proFormatId) {
        await Invoice.updateOne({ orderId: orderId }, { $set: { proFormatId: proFormatId, proFormatPath: `${invoiceDirectory}${proFormatId}.pdf` } }).exec();
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

    this.getProFormatPath = async function (orderId) {
        var invoice = await Invoice.findOne({ orderId: orderId }).exec();
        if (!invoice) {
            return orderId;
        }
        else {
            proFormatPath = invoice.proFormatPath;
            return proFormatPath;
        }
    }
}