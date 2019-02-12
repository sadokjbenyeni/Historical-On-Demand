//Configuration MODEL
 
const mongoose = require('mongoose');

let RoleSchema = new mongoose.Schema({
  name: { type: String, maxlength: 200 },
  slug: { type: String, maxlength: 200 },
  pages: { type: Array },
}, { timestamps: true });


RoleSchema.methods.AllRole = function () {
  return {
    name: this.name,
    slug: this.slug,
    pages: this.pages
  }
};

RoleSchema.methods.findById = function(id, cb) {
 return this.find({ _id: Object(id) }, cb);
};

mongoose.model('Role', RoleSchema);