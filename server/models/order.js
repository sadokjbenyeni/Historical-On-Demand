//Configuration MODEL

const mongoose = require('mongoose');

let OrderSchema = new mongoose.Schema({
  id: { type: Number }, //id incrementer dès le début du panier
  idCommande: { type: String, maxlength: 200 },
  id_cmd: { type: String, maxlength: 200 },
  submissionDate: { type: Date },
  validatedDate: { type: Date },
  idFacture: { type: String, maxlength: 200 },
  //Begin Information User
  idUser: { type: String, maxlength: 200 },
  email: { type: String, maxlength: 200 },
  companyName: { type: String, maxlength: 200 },
  addressBilling: { type: String, maxlength: 200 },
  cityBilling: { type: String, maxlength: 200 },
  countryBilling: { type: String, maxlength: 3 },
  postalCodeBilling: { type: String, maxlength: 10 },
  vat: { type: String, maxlength: 15 },
  //End Information User
  payment: { type: String, maxlength: 200 },
  paymentDate: { type: Date },
  vatValue: { type: Number, default: null },
  currency: { type: String, maxlength: 5, default: 'usd' },
  currencyTxUsd: { type: Number, default: 1 },
  discount: { type: Number, default: 0 },
  totalExchangeFees: { type: Number, default: 0 },
  totalHT: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  survey: { type: Array },
  state: { type: String },
  reason: { type: String },
  products: { type: Array },
  logs: { type: Array },
  logsPayment: { type: Array },
  validationCompliance: { type: Boolean, default: false },
  validationProduct: { type: Boolean, default: false },
  validationFinance: { type: Boolean, default: false },
  internalNote: { type: String, default: null },
  sales: { type: String, default: 'no sales' },
  type: { type: String, default: 'NA' },
  paid: { type: Boolean, default: false },
}, { timestamps: true });

mongoose.model('Order', OrderSchema);