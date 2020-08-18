const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Payment = mongoose.model('Payment');

router.get('/', async (req, res) => {
    let payment = await Payment.find().exec();
    if (!payment) return res.sendStatus(404);
    return res.status(200).json(payment);
});

router.get('/active', async (req, res) => {
    let payment = await Payment.find({ active: "1" }).exec();
    if (!payment) { return res.sendStatus(404); }
    return res.status(200).json(payment);
});

router.put('/', async (req, res) => {
    let payment = await Payment.updateOne({ _id: req.body._id }, { $set: { id: req.body.id, name: req.body.name, active: req.body.active, max: req.body.max } }).exec();
    if (!payment) { return res.sendStatus(404); }
    return res.status(200).json({ message: req.body.name + ' has been updated' });
});

module.exports = router;