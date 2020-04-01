 
const mongoose = require('mongoose');

let RoleSchema = new mongoose.Schema({
  name: { type: String, maxlength: 200 },
}, { timestamps: true });


mongoose.model('Sale', RoleSchema);