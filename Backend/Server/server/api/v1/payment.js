const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Payment = mongoose.model('Payment');

//const config = require('../../config/config.js');
//const URLS = config.config();
// const admin = config.admin();

router.get('/', (req, res) => {
    Payment.find().then((payment) => {
        if (!payment) { return res.sendStatus(404); }
        return res.status(200).json(payment);
    });
});

router.get('/active', (req, res) => {
    Payment.find({active: "1"}).then((payment) => {
        if (!payment) { return res.sendStatus(404); }
        return res.status(200).json(payment);
    });
});

router.put('/', (req, res) => {
    Payment.updateOne({_id:req.body._id}, {$set:{id: req.body.id, name: req.body.name, active: req.body.active, max: req.body.max}}).then((payment) => {
        if (!payment) { return res.sendStatus(404); }
        return res.status(200).json({message: req.body.name + ' has been updated'});
    });
});

module.exports = router;