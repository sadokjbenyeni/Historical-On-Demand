const mongoose = require('mongoose');
const Orders = mongoose.model('Order');
const Users = mongoose.model('User');
const orderService = require("./orderService");
const fluxService = require("./fluxService");
const { order } = require('paypal-rest-sdk');

module.exports.getListOrders = async (sortAttribute, sortValue, start, length, state, columns, search) => {
    let sort = {};
    // sort.createdAt = -1;
    sort[sortAttribute] = sortValue;

    // var orderTotalCount = Order.count({ state: { $ne: '' }, state: { $exists: true } }).exec();
    let searchObject = buildSearch(state, columns, search);
    var orderCount = await Orders.countDocuments(searchObject).exec();
    try {
        var orders = await Orders.find(searchObject)
            .sort(sort)
            .skip(start)
            .limit(length)
            .collation({ locale: "en" })
            .exec();
        const cube = await fluxService.getChangeRateCube();
        //   draw: req.body.draw
        for (let i = 0; i < orders.length; i++) {
            if (["PSC", "PBI", "CART", "PLI"].indexOf(orders[i].state) != -1) {
                const user = await Users.findOne({ _id: orders[i].idUser }).exec()
                const formattedOrder = await orderService.calculateAmountsOfOrder(JSON.parse(JSON.stringify(orders[i])), user.currency, cube);
                orders[i].total = formattedOrder.totalHT;
                orders[i].currency = user.currency;
            }

        }
        return { recordsFiltered: orderCount, listorders: orders };

    } catch (error) {
        req.logger.error({ message: error.message + '\n' + error.stack, className: "Order API" });
        throw new Error("an error occured");
    }
}

function buildSearch(state, columns, search) {
    let searchObject = {};
    // search['state'] = { $ne: '' };
    // search['state'] = { $exists: true };
    if (state) {
        searchObject['state'] = state;
    }
    columns.forEach(column => {
        if (column.data === 'redistribution' && column.search.value !== '') {
            searchObject['survey.dd'] = column.search.value;
        } else if (column.data === 'submissionDate' && column.search.value !== '') {
            let d = column.search.value.split('|');
            searchObject['submissionDate'] = { $gte: new Date(d[0]), $lt: new Date(d[1]) };
        }
        else if (column.data === 'purchasetype' && column.search.value) {
            if (column.search.value == '1') {
                searchObject['products'] = {
                    $not: { $elemMatch: { subscription: 1, onetime: 0 } }
                };
            }
            if (column.search.value == '2') {
                searchObject['products'] = {
                    $not: { $elemMatch: { subscription: 0, onetime: 1 } }
                };
            }
            if (column.search.value == '3') {
                searchObject['$and'] = [{ 'products': { $elemMatch: { subscription: 1, onetime: 0 } } },
                { 'products': { $elemMatch: { subscription: 0, onetime: 1 } } }];
            }

        }
        else if (column.data === 'id' && column.search.value !== '') {
            searchObject[column.data] = parseInt(column.search.value);
        } else if ((column.data === 'total' || column.data === 'discount') && column.search.value !== '') {
            searchObject[column.data] = parseFloat(column.search.value);
        } else if (column.search.value !== '') {
            searchObject[column.data] = new RegExp(column.search.value, "i");
        }

    });
    if (search.value !== '') {
        search['$or'] = [
            { state: new RegExp(req.body.search.value, "i") },
            { companyName: new RegExp(req.body.search.value, "i") },
            { id_cmd: new RegExp(req.body.search.value, "i") }
        ];
    }
    return searchObject;
}