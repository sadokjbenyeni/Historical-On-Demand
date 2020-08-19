const mongoose = require('mongoose');

let CompanytypeSchema = new mongoose.Schema({
  id: { type: String},
  name: { type: String, maxlength: 200 }
}, { timestamps: true });

CompanytypeSchema.methods.AllCompanytype = function () {
  return {
    id: this.id,
    name: this.name
  }
};

CompanytypeSchema.methods.findById = function(id, cb) {
 return this.find({ _id: Object(id) }, cb);
};

mongoose.model('Companytype', CompanytypeSchema);