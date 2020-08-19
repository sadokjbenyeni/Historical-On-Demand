const flux = require('./fluxService')
module.exports.convertproductsFeestoCurrency = (products, userCurrency, cube) => {
    products.forEach(item => {
        if (!item.historical_data.backfill_applyfee) item.TotalFees = 0;
        else if (item.TotalFees != 0 && userCurrency != item.feesCurrency) {
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
        order.currencyTxUsd = ratio;
        var totalht = 0
        order.products.forEach(item => {
            item.subscription.forEach(subsc => {
                subsc.ht *= ratio
                totalht += subsc.ht
            })
            item.onetime.forEach(oneoff => {
                oneoff.ht *= ratio
                totalht += oneoff.ht

            })
        })
        order.totalHT = totalht + order.totalExchangeFees
        order.currency = currency;
    }
}
function getRatio(currencyfrom, currencyTo, cube) {
    var ratio = 1;
    if (currencyfrom.toUpperCase() != 'EUR') ratio /= flux.search(currencyfrom.toUpperCase(), cube);
    if (currencyTo.toUpperCase() != 'EUR') ratio *= flux.search(currencyTo.toUpperCase(), cube);
    return ratio;
}


