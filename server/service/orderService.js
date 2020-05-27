const mongoose = require('mongoose');
const Orders = mongoose.model('Order');
const Users = mongoose.model('User')
const User = mongoose.model('User');
const dnwfile = require('../config/config').dnwfile();
const currencieService = require('./currencieService');

module.exports.updateOrderMetaData = async (id, note, sales, type) => {
    var orderToUpdate = await Orders.findOne({ id: id }).exec();    
    orderToUpdate.internalNote = note;
    orderToUpdate.sales = sales;
    orderToUpdate.type = type
    await Orders.update({ _id: orderToUpdate._id }, { $set: orderToUpdate }).exec();
};

module.exports.getLinks = async (token, orderId) => {
    return Users.findOne({ token: token }, { _id: true }).then(result => {
        if (result) {
            return Orders.findOne({ id: orderId, idUser: result._id }, { products: true, state: true, createdAt: true }).then(
                order => {
                    if (order) {
                        return order.products.filter(item => item.status == "active");
                    }
                })
        }
    }).then(products => {
        let links = []
        products.forEach(item => {
            producctlinks = []
            item.links.forEach(link => {
                if (item.subscription == 1) {
                    link.links = [link.links[0]];
                }
                link.links.forEach(element => {
                    element.link.split('|').forEach(elem => {
                        producctlinks.push(dnwfile + '/api/user/download/' + token + '/' + link.path + '/' + elem);
                    })
                })
            })
            links.push(producctlinks)
        })
        return links;
    })
}
module.exports.getOrderById = (token, OrderId) => {
    return Users.findOne({ token: token }).then(result => {
        if (result) {
            return Orders.findOne({ id: OrderId, idUser: result._id }).then(order => {
                order = currencieService.convertOrderPricesToCurrencie(order);
                return order;
            })
        }
    })
}
module.exports.getCaddy = async (token) => {
    var user = await Users.findOne({ token: token }).exec();
    return Orders.findOne({ idUser: user._id, state: { $in: ['CART', 'PLI', 'PBI', 'PSC'] } }).exec();
}