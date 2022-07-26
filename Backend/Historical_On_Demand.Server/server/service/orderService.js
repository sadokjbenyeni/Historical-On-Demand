const mongoose = require("mongoose");
const Orders = mongoose.model("Order");
const Users = mongoose.model("User");
const Invoices = mongoose.model("Invoice");
const dnwfile = require("../config/config").dnwfile();
const currencyService = require("./currencyService");
const feesService = require("./feesService");
const fluxService = require("./fluxService");
const configService = require("../service/configService");
const vatService = require("../service/vatService");
const userService = require("../service/userService");
const { invoice, order } = require("paypal-rest-sdk");

module.exports.getOrderDetails = async (orderId, userId) => {
    var RawOrder = await Orders.findOne({ idUser: userId, _id: orderId }).exec();
    if (!RawOrder) throw new error("Order not found");
    if (isInvoice(RawOrder.state)) {
        var invoice = await Invoices.findOne({ orderIdReference: RawOrder._id, state: { $ne: 'Aborted' } }).exec();
        RawOrder.idCommande = invoice.invoiceId;
        RawOrder.idProForma = invoice.proFormaId
        RawOrder.discount = invoice.discount;

    }
    else {
        var user = await userService.getUserById(userId);
        var invoice = await this.calculateAmountsOfOrder(JSON.parse(JSON.stringify(RawOrder)), user.currency, undefined)
        invoice.total = invoice.totalHT;
        setOrderValuesFromInvoice(RawOrder, invoice);
    }
    try {
        return clientOrderDetails(RawOrder);
    }
    catch (error) {
        req.logger.error({ message: error.message + "\n" + error.stack, className: "Order API" });
        throw new error(error.message);
    }
}

clientOrderDetails = function (order) {
    if (!order) return {};
    const container = {};
    container._id = order._id;
    container.id = order.id;
    container.idCommande = order.idCommande;
    container.idProForma = order.idProForma;
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
        delete product.logs
    });
    container.idUser = order.idUser;
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

function checkifSubscription(product) {
    return product.subscription == 1 ? "subscription" : "onetime";
}

module.exports.getUserOrdersHistory = async (userId) => {
    user = await userService.getUserById(userId, { currency: true });
    var caddy = await this.getCaddy(undefined, undefined, user);
    var invoices = await Invoices.find({ userId: userId, state: { $ne: 'Aborted' } }).sort({ orderId: 1, updatedAt: 1 }).exec();
    uniqueInvoicesSelector(invoices);
    invoices = invoices.map((item) => ToOrderDto(item, false));
    if (caddy) {
        caddy = ToOrderDto(caddy, true, user.currency);
        invoices = invoices.concat(caddy);
    }
    return invoices;
};

function uniqueInvoicesSelector(invoices) {
    let stepper = 0;
    while (stepper < invoices.length - 1) {
        try {
            if (invoices[stepper].orderId == invoices[stepper + 1].orderId) {
                while (invoices[stepper].orderId == invoices[stepper + 1].orderId) {
                    invoices.splice(stepper, 1);
                }
            }
            stepper++;
        }
        catch (error) {
        }
    }
}

function ToOrderDto(order, isCaddy, currency = undefined) {
    return (order = {
        _id: isCaddy ? order._id : order.orderIdReference,
        id: isCaddy ? order.id : order.orderId,
        idCommande: isCaddy ? order.idCommande : order.invoiceId,
        idProForma: isCaddy ? order.idProForma : order.proFormaId,
        submissionDate: order.submissionDate,
        state: order.state,
        currency: currency ? currency : order.currency,
        total: isCaddy ? order.totalHT : order.total,
    });
}

module.exports.updateOrderMetaData = async (id, note, sales, type) => {
    var orderToUpdate = await Orders.findOne({ id: id }).exec();
    if (!orderToUpdate) throw new Error("Order with Id " + id + " not found");
    orderToUpdate.internalNote = note;
    orderToUpdate.sales = sales;
    orderToUpdate.type = type;
    await Orders.update({ _id: orderToUpdate._id }, { $set: orderToUpdate }).exec();
};
module.exports.getLinks = async (user, order, logger) => {
    if (!user) throw Error("User is undefined");
    if (!order) throw Error("Order is undefined");
    logger.info({ message: order.id + ": getting links... ", className: "Order Service" });
    var products = order.products.filter((product) => product.links !== undefined && product.links.length > 0);
    var result = products
        .map((product) => {
            logger.debug({ message: "product: " + product.id_undercmd + " => links: " + JSON.stringify(product.links), className: "Order Service" });
            if (product.subscription === 1) {
                product.links = [product.links.filter((link) => link !== undefined && link.status === "active" && link.links !== undefined && link.links.length > 0).pop()];
            }
            return product.links
                .filter((linkContainer) => linkContainer && linkContainer !== undefined && linkContainer.status === "active" && linkContainer.links !== undefined && linkContainer.links && linkContainer.links.length > 0)
                .map((linkObj) => linkObj.links.filter((element) => element && element.link !== undefined))
                .reduce((left, right) => left.concat(right))
                .map((links) => links.link.split("|").map((elem) => dnwfile + "/api/v1/user/download/" + user.token + "/" + product.id_undercmd + "/" + elem));
        }).map((master) => master.reduce((left, right) => left.concat(right)));
    return result;
};
module.exports.getOrderById = async (OrderId) => {
    var order = await Orders.findOne({ _id: OrderId }).exec();
    if (isInvoice(order.state)) var invoice = await Invoices.findOne({ orderId: order.id, state: { $ne: 'Aborted' } });
    else {
        var user = await userService.getUserById(order.idUser);
        var invoice = await this.calculateAmountsOfOrder(JSON.parse(JSON.stringify(order)), user.currency);
    }
    setOrderValuesFromInvoice(order, invoice);
    invoice.total = invoice.totalHT;
    return order;
};
module.exports.getCaddy = async function async(userId = undefined, currency = undefined, user = undefined) {
    if (!user) user = await userService.getUserById(userId, { currency: true });
    var caddy = await getOrderByUserId(user._id);
    if (caddy) {
        if (!currency) currency = user.currency;
        await this.calculateAmountsOfOrder(caddy, currency, undefined)
        return caddy;
    }
    return undefined;
};
async function getOrderByUserId(userId) {
    return await Orders.findOne({ idUser: userId, state: { $in: ["CART", "PLI", "PBI", "PSC"] }, }).exec();
}
function setOrderValuesFromInvoice(order, invoice) {
    order.totalExchangeFees = invoice.totalExchangeFees;
    order.totalHTDiscountFree = invoice.totalHTDiscountFree;
    order.vatValue = invoice.vatValue * 100;
    order.total = invoice.total;
    order.totalHT = invoice.totalHT;
    order.currency = invoice.currency;
    order.discount = invoice.discount;
    order.products.forEach((product) => {
        productsEID = invoice.products.find((item) => item.eid == product.eid);
        product.ht = productsEID[checkifSubscription(product)].find((item) => item.idcmd == product.idcmd).ht;
        product.exchangefees = getExchangeFees(productsEID);
    });
}

function getExchangeFees(productsEID) {
    if (productsEID && productsEID.historical_data) return productsEID.historical_data.backfill_applyfee && !productsEID.historical_data.direct_billing ? productsEID.exchangefee : 0;
    return 0;
}

module.exports.calculateAmountsOfOrder = async (order, currency, cube) => {
    if (!cube) cube = await fluxService.getChangeRateCube();
    feesService.calculatefeesOfOrder(order, currency, cube);
    currencyService.convertproductstoCurrency(order, currency, cube);
    return order;
}
function isInvoice(state) {
    return ["PSC", "PBI", "CART", "PLI"].indexOf(state) == -1;
}

module.exports.getRawCaddy = async (userId) => {
    return await Orders.findOne({ idUser: userId, state: { $in: ["CART", "PLI", "PBI", "PSC"] } }).exec();
};
module.exports.deleteProduct = async (caddy, id_product) => {
    index = 0;
    while (index <= caddy.products.length - 1) {
        if (caddy.products[index].id_undercmd == id_product) {
            if (caddy.products.length == 1) {
                await Orders.deleteOne({ id: caddy.id }).exec();
                return 1;
            } else {
                caddy.totalHT -= caddy.products[index].ht;
                caddy.products.splice([index], 1);
                await Orders.updateOne({ id: caddy.id }, { $set: { products: caddy.products } }).exec();
                return 2;
            }
        }
        index++;
    }
    return 3;
};
module.exports.UpdateProductDate = async (caddy, id_product, dateToChange, date) => {
    index = 0;
    modified = false;
    while (index <= caddy.products.length - 1) {
        if (caddy.products[index].id_undercmd == id_product) {
            if (dateToChange == "begin_date") {
                if (date.setHours(0, 0, 0, 0) >= new Date(caddy.products[index].begin_date_ref).setHours(0, 0, 0, 0) && date.setHours(0, 0, 0, 0) <= new Date(caddy.products[index].end_date).setHours(0, 0, 0, 0)) {
                    caddy.products[index].begin_date = date;
                    modified = true;
                }
            }
            else {
                if (
                    date.setHours(0, 0, 0, 0) <=
                    new Date(caddy.products[index].end_date_ref).setHours(0, 0, 0, 0) &&
                    date.setHours(0, 0, 0, 0) >=
                    new Date(caddy.products[index].begin_date).setHours(0, 0, 0, 0)
                ) {
                    caddy.products[index].end_date = date;
                    modified = true;
                }
            }
            break;
        }
        index++;
    }
    if (modified) {
        const diff = (caddy.products[index].period = daysDiff(new Date(caddy.products[index].begin_date), new Date(caddy.products[index].end_date)));
        caddy.products[index].period = diff < 20 ? 20 : diff;
        caddy.products[index].ht = caddy.products[index].period * parseFloat(caddy.products[index].price);
        totalht = Math.ceil(caddy.products.reduce((sum, obj) => sum + obj.ht, 0) * 100) / 100;
        await Orders.updateOne({ id: caddy.id }, { $set: { products: caddy.products, totalHT: totalht } }).exec();
        return true;
    }
    return false;
};
function daysDiff(start, end) {
    return end - start > 0 ? Math.ceil((end - start) / (1000 * 3600 * 24)) : 0;
}

module.exports.getLink = async (user, order, productId, logger) => {
    if (!user || user === undefined) throw Error("User is undefined");
    if (!order || order === undefined) throw Error("Order is undefined");
    logger.info({ message: order.id + ": getting links... ", className: "Order Service" });
    return order.products[productId].links
        .filter((linkContainer) => linkContainer && linkContainer !== undefined && linkContainer.status === "active" && linkContainer.links !== undefined && linkContainer.links && linkContainer.links.length > 0)
        .map((linkObj) => linkObj.links.filter((element) => element && element.link !== undefined))
        .reduce((left, right) => left.concat(right))
        .map((links) => links.link.split("|").map((elem) => dnwfile + "/api/v1/user/download/" + user.token + "/" + product.id_undercmd + "/" + elem)
        );
};

module.exports.submitCaddy = async (userId, survey, currency, billingInfo) => {
    let log = {};
    let url = "/api/mail/newOrder";
    caddy = await this.getRawCaddy(userId);
    log.date = new Date();
    let eids = [];
    caddy.cityBilling = billingInfo.cityBilling;
    caddy.countryBilling = billingInfo.countryBilling;
    caddy.postalCodeBilling = billingInfo.postalCode;
    caddy.vat = billingInfo.vatNumber;
    caddy.addressBilling = billingInfo.addressBilling;
    eids = caddy.products.map((item) => item.eid);
    let corp = { email: caddy.email, idCmd: caddy.id, paymentdate: new Date(), service: "Compliance" };
    let index = caddy.products.indexOf((product) => product.onetime === 1 && product.historical_data && (product.historical_data.backfill_agreement || product.historical_data.backfill_applyfee));
    if (index != -1 || survey.dd === "1") {
        caddy.state = "PVC";
        log.referer = "Client";
    } else {
        caddy.validationCompliance = true;
        log.referer = "Autovalidation";
        caddy.state = "PVP";
    }
    log.status = caddy.state;

    await this.calculateAmountsOfOrder(caddy, currency, undefined)
    caddy.currency = currency;
    caddy.payment = "banktransfer";
    await setprices(caddy);
    await Orders.updateOne(
        { id: caddy.id },
        {
            $set: {
                countryBilling: caddy.countryBilling,
                cityBilling: caddy.cityBilling,
                postalCodeBilling: caddy.postalCodeBilling,
                addressBilling: caddy.addressBilling,
                vat: caddy.vat,
                payment: caddy.payment,
                total: caddy.total,
                currency: caddy.currency,
                totalHT: caddy.totalHT,
                totalHTDiscountFree: caddy.totalHT,
                vatval: caddy.vatValue,
                survey: survey,
                validationCompliance: caddy.validationCompliance,
                submissionDate: new Date(),
                state: caddy.state,
            }
        }
    ).exec();
    caddy.products.forEach((item) => {
        item.subscription.forEach((item) => { deleteuselessfields(item) });
        item.onetime.forEach((item) => { deleteuselessfields(item) });
    });
    var invoice = new Invoices({
        orderIdReference: caddy._id,
        orderId: caddy.id,
        totalHT: caddy.totalHT,
        totalHTDiscountFree: caddy.totalHT,
        total: caddy.total,
        currency: caddy.currency,
        survey: survey,
        validationCompliance: caddy.validationCompliance,
        submissionDate: new Date(),
        state: caddy.state,
        products: caddy.products,
        addressBilling: caddy.addressBilling,
        cityBilling: caddy.cityBilling,
        postalCodeBilling: caddy.postalCodeBilling,
        countryBilling: caddy.countryBilling,
        vat: caddy.vat,
        vatValue: caddy.vatValue,
        totalVat: caddy.totalVat,
        state: caddy.state,
        totalExchangeFees: caddy.totalExchangeFees,
        currencyTxUsd: caddy.currencyTxUsd,
        email: caddy.email,
        companyName: caddy.companyName,
        userId: caddy.idUser,
        payment: caddy.payment,
    });
    invoice.save((error) => {
        if (error) console.log(error);
    });
    var internalMail = { idCmd: caddy.id, lastname: caddy.lastname, firstname: caddy.firstname, eid: eids.join(), date: new Date(), total: caddy.total };
    if (caddy.state === "PVC") {
        internalMail.service = "Compliance";
        const compliances = await Users.find({ roleName: "Compliance" }, { email: true, _id: false }).exec();
        compliances.forEach((compliance) => { internalMail.email = compliance.email; });
    }
    if (caddy.state === "PVP") {
        internalMail.service = "Product";
        const products = await Users.find({ roleName: "Product" }, { email: true, _id: false }).exec();
        products.forEach((prod) => { internalMail.email = prod.email; });
    }
    return true;
};

async function setprices(order) {
    if (await vatService.applyVat(order.countryBilling, order.vat)) {
        let vatDetails = await configService.getVat();
        order.vatValue = vatDetails.valueVat / 100;
        order.totalVat = order.totalHT * order.vatValue;
        order.total = order.totalHT + order.totalVat;
    }
    else {
        order.vatValue = 0;
        order.totalVat = 0;
        order.total = order.totalHT;
    }
}

function deleteuselessfields(order) {
    delete order.historical_data;
    delete order.logs;
    delete order.eid;
}
module.exports.updatePreSubmitStateCaddy = async (idUser, state) => {
    const caddy = await this.getRawCaddy(idUser);
    if (!caddy) {
        throw new Error("Caddy Not Found");
    }
    await Orders.updateOne({ id: caddy.id }, { $set: { state: state } }).exec();
    return true;
};

