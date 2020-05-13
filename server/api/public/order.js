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

router.get('/details/:id', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401);
    }
    var user = await User.findOne({ token: req.headers.authorization }, { _id: true }).exec();
    var order = await Order.findOne({ idUser: user._id, _id: req.params.id }).exec();
    if (!order) {
        return res.status(200);
    }
    try {
        order = clientOrderDetails(order);
    }
    catch (error) {
        console.error("[" + req.headers.loggerToken + "] unhandle exception: " + error);
        return res.status(503).json({ message: "an error has been raised please contact support with this identifier [" + req.headers.loggerToken + "]" });
    }
    return res.status(200).json({ details: order });
})

clientOrders = function (orders) {

    return orders.map(order => {
        const container = {};

        container._id = order._id;
        container.id = order.id;
        container.idCommande = order.idCommande;
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

clientOrderDetails = function (order) {
    if (!order) {
        return {};
    }
    const container = {};
    container._id = order._id;
    container.id = order.id;
    container.idCommande = order.idCommande;
    container.submissionDate = order.submissionDate;
    container.payment = order.payment;
    container.state = order.state;
    container.companyName = order.companyName;
    container.firstname = order.firstname;
    container.lastname = order.lastname;
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