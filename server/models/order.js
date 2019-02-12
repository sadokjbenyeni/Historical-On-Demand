//Configuration MODEL

const mongoose = require('mongoose');

let OrderSchema = new mongoose.Schema({
  id: { type: Number }, //id incrementer dès le début du panier
  id_cmd: { type: String, maxlength: 200 },
  submissionDate: { type: Date },
  validatedDate: { type: Date },
  idFacture: { type: String, maxlength: 200 },
  //Begin Information User
  idUser: { type: String, maxlength: 200 },
  email: { type: String, maxlength: 200 },
  companyName: { type: String, maxlength: 200 },
  companyType: { type: String, maxlength: 200 },
  phone: { type: String, maxlength: 200 },
  website: { type: String, maxlength: 200 },
  region: { type: String, maxlength: 200 },
  job: { type: String, maxlength: 200 },
  firstname: { type: String, maxlength: 200 },
  lastname: { type: String, maxlength: 200 },
  address: { type: String, maxlength: 200 },
  city: { type: String, maxlength: 200 },
  country: { type: String, maxlength: 3 },
  postalCode: { type: String, maxlength: 10 },
  addressBilling: { type: String, maxlength: 200 },
  cityBilling: { type: String, maxlength: 200 },
  countryBilling: { type: String, maxlength: 3 },
  postalCodeBilling: { type: String, maxlength: 10 },
  vat: { type: String, maxlength: 15 },
  vatValide: { type: Boolean, default: false },
  //End Information User
  payment: { type: String, maxlength: 200 },
  paymentDate: { type: Date },
  vatValue: { type: Number },
  currency: { type: String, maxlength: 5, default: 'usd' },
  currencyTx: { type: Number },
  currencyTxUsd: { type: Number },
  discount: { type: Number, default: 0 },
  totalExchangeFees: { type: Number, default: 0 },
  totalHT: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  format: { type: Array, default: ['csv'] },
  survey: { type: Array },
  state: { type: String },
  reason: { type: String },
  products: { type: Array },
  logs: { type: Array },
  logsPayment: { type: Array },
  validationCompliance: { type: Boolean, default: false},
  validationProduct: { type: Boolean, default: false},
  validationFinance: { type: Boolean, default: false}
}, { timestamps: true });

mongoose.model('Order', OrderSchema);