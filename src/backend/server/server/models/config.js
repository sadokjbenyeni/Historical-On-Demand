//Configuration MODEL
 
const mongoose = require('mongoose');

let ConfigSchema = new mongoose.Schema({
  id: { type: String },
  valueVat: { type: Number },
  value: { type: Number },
  tab: { type: Array },
  rgx: { type: String },
  periodOneOff: {type: Number},
  downloadOneOff: {type: Number},
  linkPerFile: {type: Number},
  periodSubscription: {type: Number},
  downloadSubscription: {type: Number},
  elastic: {type: Object}
}, { timestamps: true });

mongoose.model('Config', ConfigSchema);