const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const InvoiceService = require('../../service/invoiceService');

router.post('/', (req, res) => {
    return res.status(200).json({
        ok: InvoiceService.insertInvoice(req.body.orderObjectId, req.body.commandId, req.body.userId)
    });
})

module.exports = router;
