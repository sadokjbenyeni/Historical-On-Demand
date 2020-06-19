const router = require('express').Router();
const mongoose = require('mongoose');
const InvoiceService = require('../../service/invoiceService');
const Orders = mongoose.model('Order');
path = require('path');
var mime = require('mime');
const OrderPdfService = require('../../service/orderPdfService');

router.post('/', async (req, res) => {
    var result = await new InvoiceService().insertInvoice(order.id, updt.idCommande, order.idUser);
    return res.status(200).json({ result });
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
    let directory = await new InvoiceService().getInvoicePath(order.id);
    if (directory === order.id) {
        await new OrderPdfService(order).createInvoicePdf(req.logger, order.idCommande);
        await new InvoiceService().insertInvoice(order.id, order.idCommande, order.idUser);
    }
    let file = '/' + directory;
    var filename = path.basename(file);
    var mimetype = mime.lookup(file);
    res.setHeader('File-name', filename);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    try {
        return res.sendFile(process.cwd() + file);
    }
    catch (error) {
        return res.status(404).json({ error: `Yout invoice doesn't exist, please contact support with order Id ${order.id} to generate a new one` });
    }
});

router.get('/generate/:orderId', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token provided in header" })
    }
    if (!req.params.orderId) {
        return res.status(400).json({ error: "No order id provided" })
    }
    var order = await Orders.findOne({ id: req.params.orderId }).exec();
    try {
        await new OrderPdfService(order).createInvoicePdf(req.logger, order.idCommande);
    }
    catch (error) {
        req.logger.error({ error: error, className: "Invoice API" });
        return res.status(503).json({ message: "An error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
    return res.status(200).json({ message: 'Ok' })
})
module.exports = router;
