//Configuration MODEL
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt-nodejs');

let UserSchema = new mongoose.Schema({
  id: { type: Number },
  firstname: { type: String, maxlength: 200 },
  lastname: { type: String, maxlength: 200 },
  email: { type: String, maxlength: 200 },
  password: { type: String },
  job: { type: String, maxlength: 200 },
  companyName: { type: String, maxlength: 200 },
  companyType: { type: String, maxlength: 200 },
  website: { type: String, maxlength: 200 },
  address: { type: String, maxlength: 200 },
  postalCode: { type: String, maxlength: 200 },
  city: { type: String, maxlength: 200 },
  region: { type: String, maxlength: 200 },
  idCountry: { type: String, maxlength: 200 },
  country: { type: String, maxlength: 200 },
  cgv: { type: Boolean, default: false },
  commercial: { type: Boolean, default: false },
  phone: { type: String, maxlength: 200 },
  sameAddress: { type: Boolean, default: false },
  addressBilling: { type: String, maxlength: 200 },
  postalCodeBilling: { type: String, maxlength: 200 },
  cityBilling: { type: String, maxlength: 200 },
  idCountryBilling: { type: String, maxlength: 200 },
  countryBilling: { type: String, maxlength: 200 },
  paymentMethod: { type: String, maxlength: 200 },
  currencyBilling: { type: String, maxlength: 200 },
  vat: { type: String, maxlength: 200 },
  checkvat: { type: Boolean, default: false },
  currency: { type: String, maxlength: 4, default:"eur" },
  payment: { type: String, maxlength: 30 },
  islogin: { type: Boolean, default: false },
  token: { type: String },
  nbSession: { type: Number, default: 0 },
  roleName: { type: [String], default:["Client"] }, // Client, Administrator, Product, Compliance, Finance
  role: { type: String, maxlength: 24 }, 
  state: { type: Number, default: 0 }, // 0 : non actif, 1 : actif, -1 : suspendu. Active after email validation
}, { timestamps: true });


UserSchema.methods.AllUser = function () {
  return {
    firstname: this.firstname,
    lastname: this.lastname,
    role: this.role,
    roleName: this.roleName,
    token: this.token,
    state: this.state,
    islogin: this.islogin
  }
};

// methods ======================
// generating a hash
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.findById = function(id, cb) {
 return this.find({ _id: Object(id) }, cb);
};

mongoose.model('User', UserSchema);