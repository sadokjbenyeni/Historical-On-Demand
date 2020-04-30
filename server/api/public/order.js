const router = require('express').Router();
const mongoose = require('mongoose');

const Order = mongoose.model('Order');
const User = mongoose.model('User');

const config = require('../../config/config.js');

// Client Encryption Public Key : 10001|C958CBDFC34244F25D41E5B28DA3331CA52385EE3E73B2A51FD94D302CC135DD7DC49BE19EA66CCD00BAE7D26AF00BBB39C73351D4EACC10D7D023FE0ED844BD2D53FAFA9DE26D34373DB80278FB01BD00E27F0E922A3D7AB734D0AEFC48A78CAFA8F5D92FA2CBA08509F398FF9DA8B9AB909010622C6C1DB2933F8CAAD78D6AD9FCE5C46F1D679E83224A6B4B114757B81F5F62C109A5002C4FCC7EE7DA92C2762690835EAB446F4F86D88A903241E9F1930406DC01A4FEC4ED85666D7A1C99A7A46C4ADE83F7461428E6D11E78D86005732256AA632AF34E48990366FA85C463380F424294C81D16173279EB78EDF264422BFAC487CAD9C7A6E9F363AA481B
// test : https://test.adyen.com/hpp/cse/js/8215198215590909.shtml
// Library token (aka "PublicKeyToken") : 8215198215590909
// Facture of type QH_HISTO_000000n with n auto-incremental number

router.get('/:id', (req, res) => {
    Order.findOne({ _id: req.params.id })
        .then((cmd) => {
            return res.status(200).json({ cmd: cmd });
        });
});

router.get('/', (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401);
    }
    User.findOne({ token: req.headers.authorization }, { _id: true })
        .then((result) => {
            Order.find({ idUser: result._id })
                .collation({ locale: "en" })
                .then((orders) => {
                    orders = clientOrders(orders);
                    return res.status(200).json({ listorders: orders });
                });
        });
});

router.get('/:id/metadata', (req, res) => {
    Order.findOne({ _id: req.params.id })
        .then((order) => {
            clientMetadata = clientOrderMetadata(order);
            return res.status(200).json({ metadata: clientMetadata });
        })
})

router.get('/:id/data', (req, res) => {
    Order.findOne({ _id: req.params.id })
        .then((order) => {
            clientData = clientOrderData(order);
            return res.status(200).json({ data: clientData });
        })
})

router.get('/:id/fees', (req, res) => {
    Order.findOne({ _id: req.params.id })
        .then((order) => {
            clientFees = clientOrderFees(order);
            return res.status(200).json({ fees: clientFees });
        })
})


clientOrders = function (orders) {

    return orders.map(order => {
        const container = {};

        container._id = order._id;
        container.id = order.id;
        container.id_cmd = order.id_cmd;
        container.submissionDate = order.submissionDate;
        container.state = order.state;
        container.totalHT = order.totalHT;
        container.currency = order.currency;
        container.totalExchangeFees = order.totalExchangeFees;
        container.currencyTxUsd = order.currencyTxUsd;
        container.currencyTx = order.currencyTx;
        container.discount = order.discount;
        container.vatValue = order.vatValue;
        return container;
    });
}

clientOrderMetadata = function (order) {

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

    return container;
}

clientOrderData = function (order) {

    const container = {};

    container.id = order.id;
    container.id_cmd = order.id_cmd;
    container.products = order.products;

    return container;
}

clientOrderFees = function (order) {

    const container = {};

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