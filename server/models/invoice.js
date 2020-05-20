
const mongoose = require('mongoose');

let InvoiceSchema = new mongoose.Schema({
    orderObjectId: { type: String, maxlength: 200 },
    commandId: { type: String, maxlength: 200 },
    userId: { type: String, maxlength: 200 },
    path: { type: String, maxlength: 200 }
}, { timestamps: true });

mongoose.model('Invoice', InvoiceSchema);