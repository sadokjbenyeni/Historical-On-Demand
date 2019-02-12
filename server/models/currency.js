//Configuration MODEL
const mongoose = require('mongoose');

let CurrencySchema = new mongoose.Schema({
    id: { type: String, maxlength: 4 },
    device: { type: String, maxlength: 4 },
    name: { type: String, maxlength: 30 },
    symbol: { type: String, maxlength: 2 },
    taux: { type: Number, default: 1 },
    rib: { type: Object },
    iban: { type: Object },
    bic: { type: Object },
    maxrib: { type: Number, default: 2000 },
    updated: { type: Date },
}, { timestamps: true });  

mongoose.model('Currency', CurrencySchema);