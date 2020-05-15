const router = require('express').Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Order = mongoose.model('Order');

router.get('/details/:id', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401);
    }
    var user = await User.findOne({ token: req.headers.authorization, roleName: "Support" }, { _id: true }).exec();
    if (!user) {
        req.logger.warn({ message: '[Security] Token not found', className: 'Order Support API'});
        return res.status(403).json({ message: "Access denied. Please contact support with identifier: [" + req.headers.loggerToken + "]"});
    }
    var order = await Order.findOne({ _id: req.params.id }).exec();
    try {
        order = clientOrderDetails(order);
    }
    catch (error) {
        req.logger.error({ error: error, message: error.message, className: "Order Support API"});
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
    container.idCommande = order.idCommande;
    container.job = order.job;
    container.countryBilling = order.countryBilling;
    container.products = order.products;
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
