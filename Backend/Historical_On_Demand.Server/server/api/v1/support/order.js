const router = require('express').Router();
const mongoose = require('mongoose');
const Order = mongoose.model('Order');
const userService = require('../../../service/userService');
const orderService = require('../../../service/orderService');

router.get('/details/:id', async (req, res) => {

    var order = await orderService.getOrderById(req.params.id);
    try {
        order = await supportOrderDetails(order);
    }
    catch (error) {
        req.logger.error({ message: error.message, className: "Order Support API" });
        req.logger.error({ message: JSON.stringify(error), className: "Order Support API" });
        return res.status(503).json({ message: "an error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
    return res.status(200).json({ details: order });
})

supportOrderDetails = async function (order) {

    const container = {};
    container.id = order.id;
    container.submissionDate = order.submissionDate;
    container.payment = order.payment;
    container.state = order.state;
    container.companyName = order.companyName;
    container.firstname = order.firstname;
    container.lastname = order.lastname;
    container.idCommande = order.idCommande;
    container.idProForma = order.idProForma;
    container.job = order.job;
    container.countryBilling = order.countryBilling;
    container.sales = order.sales;
    container.type = order.type;
    container.internalNote = order.internalNote;
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
    var user = await userService.getUserById(order.idUser)
    if (user) {
        container.token = user.token;
    }
    }
    return container;
}

module.exports = router;
