const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Invoice = mongoose.model('Invoice');


router.post('/', (req, res) => {

    var invoice = new Invoice({ orderObjectId: req.body.orderObjectId, commandId: req.body.commandId, userId: req.body.userId, path: 'mapr/invoices/' + req.body.commandId + '.pdf' });
    invoice.save(function (error) {
        if (error) return handleError(error);
    });
    return res.status(200).json({ 'ok': true });
})

module.exports = router;
