const router = require('express').Router();
const mongoose = require('mongoose');
const InvoiceService = require('../../service/invoiceService');
const Orders = mongoose.model('Order');
const Invoices = mongoose.model('Invoice');
path = require('path');
var mime = require('mime');
const OrderPdfService = require('../../service/orderPdfService');

router.post('/', async (req, res) => {
    await new InvoiceService().updateInvoiceInformation(req.body.ordertId, req.body.commandId);
})

router.get('/download/:orderId/:pdfType', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({ error: "No token provided in header" });
    if (!req.params.orderId) return res.status(400).json({ error: "No order id provided" });
    var order = await Orders.findOne({ id: req.params.orderId }).exec();
    let directory = '';
    if (req.params.pdfType == 'invoice') directory = await new InvoiceService().getInvoicePath(order.id);
    else if (req.params.pdfType == 'pro forma invoice') directory = await new InvoiceService().getProFormaPath(order.id);
    var filename = path.basename(directory);
    var mimetype = mime.lookup(directory);
    res.setHeader('File-name', filename);
    res.setHeader('Content-disposition', 'attachment; filename=' + filename);
    res.setHeader('Content-type', mimetype);
    try {
        return res.sendFile(directory);
    }
    catch (error) {
        return res.status(404).json({ error: `Your invoice doesn't exist, please contact support with order Id ${order.id} to generate a new one` });
    }
});

router.get('/generate/:orderId', async (req, res) => {
    if (!req.headers.authorization) return res.status(401).json({ error: "No token provided in header" });
    if (!req.params.orderId) return res.status(400).json({ error: "No order id provided" });
    var invoice = await Invoices.findOne({ orderId: req.params.orderId }).exec();
    try {
        await new OrderPdfService(invoice).createInvoicePdf(req.logger, invoice.invoiceId, 'Pro Forma Invoice Nbr');
        return res.status(200).json({ ok: true })
    }
    catch (error) {
        req.logger.error({ error: error, className: "Invoice API" });
        return res.status(503).json({ message: "An error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
})
module.exports = router;
