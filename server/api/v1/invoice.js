const router = require('express').Router();
const mongoose = require('mongoose');
const InvoiceService = require('../../service/invoiceService');
const Orders = mongoose.model('Order');
path = require('path');
var mime = require('mime');
const invoiceDirectory = require('../../config/config.js').InvoiceDirectory();


router.post('/', (req, res) => {
    return res.status(200).json({
        ok: InvoiceService.insertInvoice(req.body.orderObjectId, req.body.commandId, req.body.userId)
    });
})

router.get('/download/:orderId', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token provided in header" })
    }
    if (!req.params.orderId) {
        return res.status(400).json({ error: "No order id provided" })
    }
    // var user = await User.findOne({ token: req.headers.authorization }).exec();
    var order = await Orders.findOne({ id: req.params.orderId }).exec();
    let file = '/' + invoiceDirectory + order.idCommande + '.pdf';
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
    res.setHeader('File-name', filename);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);

    return res.sendFile(process.cwd() + file);

});
module.exports = router;
