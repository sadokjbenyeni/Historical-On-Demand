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
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token provided in header" })
    }
    if (!req.params.orderId) {
        return res.status(400).json({ error: "No order id provided" })
    }
    // var user = await User.findOne({ token: req.headers.authorization }).exec();

    var order = await Orders.findOne({ id: req.params.orderId }).exec();
    var invoice = await Invoices.findOne({ orderId: req.params.orderId }).exec();
    let directory = '';
    if (req.params.pdfType == 'invoice') {
        directory = await new InvoiceService().getInvoicePath(order.id);

    }
    else if (req.params.pdfType == 'pro format invoice') {
        directory = await new InvoiceService().getProFormatPath(order.id);
    }
    // if (directory === order.id) {
    //     if (invoice.proFormatId) {
    //         await new OrderPdfService(order).createInvoicePdf(req.logger, order.idCommande, 'Invoice Nbr');
    //     }
    //     else {
    //         await new OrderPdfService(order).createInvoicePdf(req.logger, order.idCommande, 'Pro Forma Invoice Nbr');
    //     }
    //     await new InvoiceService().updateInvoiceInformation(order.id, order.idCommande);

    // }
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
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token provided in header" })
    }
    if (!req.params.orderId) {
        return res.status(400).json({ error: "No order id provided" })
    }
    var invoice = await Invoices.findOne({ orderId: req.params.orderId }).exec();
    try {
        await new OrderPdfService(invoice).createInvoicePdf(req.logger, invoice.invoiceId, 'Pro Forma Invoice Nbr');
    }
    catch (error) {
        req.logger.error({ error: error, className: "Invoice API" });
        return res.status(503).json({ message: "An error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
    return res.status(200).json({ message: 'Ok' })
})
module.exports = router;
