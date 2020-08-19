const mongoose = require('mongoose');

let ExchangeSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
}, { timestamps: true });

mongoose.model('Exchange', ExchangeSchema);