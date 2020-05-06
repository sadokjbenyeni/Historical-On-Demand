const router = require('express').Router();
const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const config = require('../../config/config.js');

router.get('/details/:id', async (req, res) => {

    var order = await Order.findOne({ _id: req.params.id }).exec();
    try {
        order = clientOrderDetails(order);
    }
    catch (error) {
        console.error("[" + req.headers.loggerToken + "] unhandle exception: " + error);
        return res.status(503).json({ message: "an error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
    return res.status(200).json({ details: order });
})

clientOrderDetails = function (order) {

    const container = {};
    container.id = order.id;
    container.submissionDate = order.submissionDate;
    container.payment = order.payment;
    container.state = order.state;
    container.companyName = order.companyName;
    container.firstname = order.firstname;
    container.lastname = order.lastname;
    container.id_cmd = order.id_cmd;
    container.job = order.job;
    container.countryBilling = order.countryBilling;
    container.products = order.products;
    container.products.forEach(product => {
        product.logs = null;
    });
    container.currency = order.currency;
    container.currencyTx = order.currencyTx;
    container.currencyTxUsd = order.currencyTxUsd;
    container.discount = order.discount;
    container.totalExchangeFees = order.totalExchangeFees;
    container.totalHT = order.totalHT;
    container.total = order.total;
    container.idFacture = order.idFacture;
    container.vat = order.vat;
    container.vatValide = order.vatValide;
    container.vatValue = order.vatValue;
    return container;
}

module.exports = router;
