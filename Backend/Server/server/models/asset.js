//Configuration MODEL
 
const mongoose = require('mongoose');

let AssetSchema = new mongoose.Schema({
  id: { type: String },
  name: { type: String },
}, { timestamps: true });

mongoose.model('Asset', AssetSchema);