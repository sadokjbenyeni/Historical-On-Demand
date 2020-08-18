const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')

const invoiceDirectory = global.environment.InvoiceDirectory;

const http = require('http');

module.exports = function () {
    this.updateInvoiceInformation = async function (orderId, invoiceId, status) {
        await Invoice.updateOne({ orderId: orderId, state: { $ne: 'Aborted' } }, { $set: { state: status, invoiceId: invoiceId, path: `${invoiceDirectory}${invoiceId}.pdf` } }).exec();
    }

    this.updateProFormaInformation = async function (orderId, proFormaId) {
        await Invoice.updateOne({ orderId: orderId, state: { $ne: 'Aborted' } }, { $set: { proFormaId: proFormaId, proFormaPath: `${invoiceDirectory}${proFormaId}.pdf` } }).exec();
    }

    this.getInvoicePath = async function (orderId) {
        var invoice = await Invoice.findOne({ orderId: orderId, state: { $in: ['validated', 'active'] } }).exec();
        if (!invoice) return orderId;
        else return invoice.path;
    }

    this.getProFormaPath = async function (orderId) {
        var invoice = await Invoice.findOne({ orderId: orderId, state: { $in: ['validated', 'active', 'PVF'] } }).exec();
        if (!invoice) return orderId;
        else return invoice.proFormaPath;
    }
}