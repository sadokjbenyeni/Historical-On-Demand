module.exports.convertOrderPricesToCurrencie = (order, currencyTxUsd) => {
    order.totalHT /= currencyTxUsd;
    order.total = (order.total / currencyTxUsd).toFixed(2);
    order.products.forEach(product => {
        product.ht /= currencyTxUsd;
        product.price = (product.price / currencyTxUsd).toFixed(2);
    });
    return order;
} 