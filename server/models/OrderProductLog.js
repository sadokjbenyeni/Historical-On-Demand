//Configuration MODEL

const mongoose = require('mongoose');

let OrderProductLogSchema = new mongoose.Schema({
    extract: { type: String, maxlength: 1024 },
    referer: { type: String, maxlength: 10 },
    orderId: { type: String, maxlength: 200 },
    id_cmd: { type: String, maxlength: 255 },
    productId: { type: Number },
    date: { type: Date },
    idUser: { type: String, maxlength: 200 },
    status: { type: String, maxlength: 255 },
    state_description: { type: String, maxlength: 255 },
    log: { type: String, maxlength: 2048 },
}, { timestamps: true });

mongoose.model('OrderProductLog', OrderProductLogSchema);