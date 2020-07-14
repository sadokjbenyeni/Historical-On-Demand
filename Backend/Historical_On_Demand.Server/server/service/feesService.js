const currencyService = require('./currencyService');
const fluxService = require('./fluxService')
module.exports.calculatefeesOfOrder = (order, currency, cube) => {
    if (order.products) {
        order.products = splitproductsbyEID(order);
        order.products.forEach(item => {
            var totalmounths = 0;
            if (item.historical_data.backfill_applyfee && !(item.historical_data.direct_billing)) {
                if (item.onetime.length != 0) {
                    var orderedproducts = item.onetime.sort((a, b) => new Date(a.begin_date) - new Date(b.begin_date))
                    //filter true is the easiest way to duplicate objects
                    var orderOneTimesWithoutOverlap = deleteoverlap([...orderedproducts]);
                    orderOneTimesWithoutOverlap.forEach(item => {
                        totalmounths += monthDiff(new Date(item.begin_date), new Date(item.end_date))
                    })
                }
                if (item.subscription.length != 0) {
                    totalmounths += Math.max(...item.subscription.map(element => element.period))
                }
                item.TotalFees = totalmounths * item.exchangefee
            }
            else {
                item.TotalFees = 0;
            }
        })
        currencyService.convertproductsFeestoCurrency(order.products, currency, cube);
        order.totalExchangeFees = order.products.reduce((a, b) => a + b.TotalFees, 0)
    }
}

function splitproductsbyEID(order) {
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
            feesCurrency: productsEID[0].historical_data.backfill_applyfee ? productsEID[0].historical_data.backfill_fee ? productsEID[0].historical_data.backfill_fee.split(' ')[1] : null : null,
            exchangefee: productsEID[0].historical_data.backfill_applyfee ? productsEID[0].historical_data.backfill_fee ? productsEID[0].historical_data.backfill_fee.split(' ')[0] : 0 : null,
            subscription: subcrtiptionstab, onetime: ontimetab
        });
    });
    return mapEID;
}
function IsDateinRange(date, datebegining, dateend) {
    datebegining = new Date(datebegining).setDate(1);
    date = new Date(date).setDate(1);
    dateend = new Date(dateend).setDate(1);

    if (datebegining <= date && date <= dateend)
        return 0
    if (datebegining > date)
        return -1
    if (date > dateend)
        return 1
}
function deleteoverlap(orderedproducts) {
    dates = [];
    while (orderedproducts.length != 0) {
        if (orderedproducts.length == 1) {
            dates.push(orderedproducts[0])
        }
        else if (IsDateinRange(...orderedproducts[0].end_date, ...orderedproducts[1].begin_date, ...orderedproducts[1].end_date) == 0) {
            orderedproducts[1].begin_date = orderedproducts[0].begin_date
        }
        else if (IsDateinRange(...orderedproducts[0].end_date, ...orderedproducts[1].begin_date, ...orderedproducts[1].end_date) == 1) {
            orderedproducts[1].begin_date = orderedproducts[0].begin_date
            orderedproducts[1].end_date = orderedproducts[0].end_date

        }
        else { // in this case begin date and end date of the first product are bouth out of range of the next 
            dates.push(orderedproducts[0])
        }
        orderedproducts.splice(0, 1);
    }
    return dates
}
function monthDiff(d1, d2) {
    var months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    return months <= 0 ? 0 : months + 1;
}