const mongoose = require('mongoose')
const Invoice = mongoose.model('Invoice')

module.exports.insertInvoice = (orderObjectId, commandId, userId) => {
    var invoice = new Invoice({ orderObjectId: orderObjectId, commandId: commandId, userId: userId, path: 'mapr/invoices/' + commandId + '.pdf' });
    invoice.save(function (error) {
        if (error) return handleError(error);
    });
}