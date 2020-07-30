const LoggerFactory = require("./logger.js");
const logger = new LoggerFactory().createLogger("System");

global.environment = require("../../../Backend/Historical_On_Demand.Server/server/environment/environment.json");
global.config = require("../../../Backend/Historical_On_Demand.Server/server/environment/environment.json");
logger.info({
    message: `Starting migration from orders to invoices, on ${global.environment.environment_name} environment`,
    className: "Server",
});

const mongoose = require("mongoose");

//Connect to mongoDB server
mongoose.connect(global.environment.database.connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: global.environment.database.dbname,
    user: global.environment.database.userdb,
    pass: global.environment.database.passdb,
    authSource: global.environment.database.authdb,
});
mongoose.set("debug", true);
require("./models/config");
require("./models/order");
require("./models/invoice");

const Orders = mongoose.model("Order");
const Invoices = mongoose.model("Invoice");
var basePathInvoices = global.config.InvoiceDirectory;
if(basePathInvoices.substr(basePathInvoices.length - 1) !== '/')
{
    basePathInvoices += '/'
}
Orders.aggregate([{ $lookup: { from: 'invoices', localField: 'id', foreignField: 'orderId', as: 'order_invoice' } },
{ $match: { order_invoice: [] } }])
    .then(orders => {
        var invoices = orders.filter(order => order.products && order.products.length > 0)
            .map(order => {
                order.products.forEach(product => deleteuselessfields(product));
                var invoice = new Invoices({
                    orderIdReference: order._id,
                    orderId: order.id,
                    totalHT: order.totalHT,
                    totalHTDiscountFree: order.totalHT,
                    total: order.total,
                    currency: order.currency,
                    survey: order.survey,
                    validationCompliance: order.validationCompliance,
                    submissionDate: new Date(),
                    state: order.state,
                    // products: order.products,
                    addressBilling: order.addressBilling,
                    cityBilling: order.cityBilling,
                    postalCodeBilling: order.postalCodeBilling,
                    countryBilling: order.countryBilling,
                    vat: order.vat,
                    vatValue: order.vatValue,
                    totalVat: order.totalVat,
                    state: order.state,
                    totalExchangeFees: order.totalExchangeFees,
                    currencyTxUsd: order.currencyTxUsd,
                    email: order.email,
                    companyName: order.companyName,
                    userId: order.idUser,
                    payment: order.payment,
                    invoiceId: order.idCommande,
                    path: global.config.InvoiceDirectory + order.idCommande + '.pdf'
                    //path:  TODO code the file invoice algo
                });
                invoice.products = groupProductsbyEID(order);
                return invoice;
            });
            Invoices.insertMany(invoices, function(error)
            {
                if(error){
                    logger.error(error.message + '\n' + error.stack);
                }
            })
    })
    .catch(error => {
        logger.error(error.message + '\n' + error.stack);
        return process.exit(-1);
    });

function groupProductsbyEID(order) {
    var setEID = new Set(Array.from(order.products, item => item.eid));
    var mapEID = []
    setEID.forEach(eid => {
        var subcrtiptionstab = []
        var ontimetab = []
        var productsEID = order.products.filter(item => item.eid == eid)
        productsEID.forEach(item => {
            if (item.subscription == 1) {
                subcrtiptionstab.push(item);
            }
            else {
                ontimetab.push(item);
            }
        });
        mapEID.push({
            eid: eid,
            exchangeName: productsEID[0].exchangeName,
            historical_data: productsEID[0].historical_data,
            feesCurrency: !productsEID[0].historical_data ? null : productsEID[0].historical_data.backfill_applyfee ? productsEID[0].historical_data.backfill_fee ? productsEID[0].historical_data.backfill_fee.split(' ')[1] : null : null,
            exchangefee: !productsEID[0].historical_data ? 0 : productsEID[0].historical_data.backfill_applyfee ? productsEID[0].historical_data.backfill_fee ? productsEID[0].historical_data.backfill_fee.split(' ')[0] : 0 : null,
            subscription: subcrtiptionstab,
            onetime: ontimetab
        });
    });
    return mapEID;
}

function deleteuselessfields(order) {
    delete order.historical_data;
    delete order.logs;
}