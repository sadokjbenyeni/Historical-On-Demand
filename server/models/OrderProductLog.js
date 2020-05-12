//Configuration MODEL

const mongoose = require('mongoose');

let OrderProductLogSchema = new mongoose.Schema({
    id_undercmd: { type: String, maxlength: 255 },
    orderId: { type: String, maxlength: 200 },
    productId: { type: Number },
    referer: { type: String, maxlength: 10 },
    status: { type: String, maxlength: 255 },
    state_description: { type: String, maxlength: 255 },
    idUser: { type: String, maxlength: 200 },
    date: { type: Date },
    log: { type: String, maxlength: 2048 },
    extract: { type: Object, maxlength: 1024 },
}, { timestamps: true });

mongoose.model('OrderProductLog', OrderProductLogSchema);