//Configuration MODEL
 
const mongoose = require('mongoose');

let PoolSchema = new mongoose.Schema({
    index: { type: String },
    id_cmd: { type: String },
    onetime: { type: Number },
    subscription: { type: Number },
    eid: { type: Number },
    contractID: { type: String },
    qhid: { type: Number },
    quotation_level: { type: String },
    begin_date: { type: String },
    end_date: { type: String },
    status: { type: String }
}, { timestamps: true });

mongoose.model('Pool', PoolSchema);