const flux = require('./fluxService')
module.exports.convertOrderPricesToCurrencie = (order, currencyTxUsd) => {
    order.totalHT /= currencyTxUsd;
    order.total = (order.total / currencyTxUsd).toFixed(2);
    order.products.forEach(product => {
        product.ht /= currencyTxUsd;
        product.price = (product.price / currencyTxUsd).toFixed(2);
    });
    return order;
}
module.exports.convertproductsFeestoCurrency = (products, userCurrency, cube) => {
    products.forEach(item => {
        if (!item.historical_data.backfill_applyfee) {
            item.TotalFees = 0;
        }
        else if (userCurrency != item.feesCurrency) {
            var ratio = getRatio(item.feesCurrency, userCurrency, cube)
            item.currencyTx = ratio;
            item.TotalFees *= ratio;
            item.exchangefee *= ratio;
            item.feesCurrency = userCurrency;
        }
    })
}
module.exports.convertproductstoCurrency = (order, currency, cube) => {
    if (currency != "usd".toUpperCase()) {

        ratio = getRatio("usd", currency, cube);
        order.currencyTxUsd =ratio;
            order.products.forEach(item => {
                item.subscription.forEach(subsc => {
                    subsc.ht *= ratio
                })
                item.onetime.forEach(oneoff => {
                    oneoff.ht *= ratio
                })
            })
        order.totalHT = (order.totalHT * ratio) + order.totalExchangeFees
    }
}
function getRatio(currencyfrom, currencyTo, cube) {
    var ratio = 1;
    if (currencyfrom.toUpperCase() != 'EUR') {
        ratio /= flux.search(currencyfrom.toUpperCase(), cube)
    }
    if (currencyTo.toUpperCase() != 'EUR') {
        ratio *= flux.search(currencyTo.toUpperCase(), cube)
    }
    return ratio;
}

