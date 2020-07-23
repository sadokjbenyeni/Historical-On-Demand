//Configuration MODEL
 
const mongoose = require('mongoose');

let PaymentSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 0 },
  delay: { type: Number, default: 24 },
  active: { type: String, default: '0' },
}, { timestamps: true });

mongoose.model('Payment', PaymentSchema);