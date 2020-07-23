//Configuration MODEL
 
const mongoose = require('mongoose');

let CountrieSchema = new mongoose.Schema({
  id: { type: String, maxlength: 3 },
  name: { type: String, maxlength: 200 },
  ue: { type: String, default: "0" },
  rgx: { type: String }
}, { timestamps: true });


CountrieSchema.methods.AllCountrie = function () {
  return {
    id: this.id,
    name: this.name,
    ue: this.ue,
    rgx: this.rgx
  }
};

CountrieSchema.methods.findById = function(id, cb) {
 return this.find({ _id: Object(id) }, cb);
};

mongoose.model('Countrie', CountrieSchema);