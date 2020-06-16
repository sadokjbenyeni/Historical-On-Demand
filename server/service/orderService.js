const mongoose = require('mongoose');
const Orders = mongoose.model('Order');
const Users = mongoose.model('User')
const dnwfile = require('../config/config').dnwfile();
const currencieService = require('./currencieService');

module.exports.updateOrderMetaData = async (id, note, sales, type) => {
    var orderToUpdate = await Orders.findOne({ id: id }).exec();    
    orderToUpdate.internalNote = note;
    orderToUpdate.sales = sales;
    orderToUpdate.type = type
    await Orders.update({ _id: orderToUpdate._id }, { $set: orderToUpdate }).exec();
};
module.exports.getLinks = async (user, order, logger) => {
    if(!user || user === undefined)
    {
        throw Error('User is undefined');
    }
    if(!order || order === undefined)
    {
        throw Error('Order is undefined');
    }
    logger.info({message:  order.id + ': getting links... ', className: 'Order Service'});
    var products = order.products.filter(product => product !== undefined);    
    products = products.filter(product => product.links !== undefined && product.links.length > 0);
    var result = products.map(product => 
        {
            logger.debug({message: 'product: ' + product.id_undercmd + ' => links: ' + JSON.stringify(product.links), className: 'Order Service'});
            if (product.subscription === 1) {                
                product.links = [product.links.filter(link => link !== undefined && link.status === "active" && link.links !== undefined && link.links.length > 0).pop()];
                //link.links = [link.links[0]];
            }
            return product.links
                        .filter(linkContainer => linkContainer && linkContainer !== undefined &&  linkContainer.status === "active" 
                                              && linkContainer.links !== undefined && linkContainer.links && linkContainer.links.length > 0)
                        .map(linkObj => linkObj.links.filter(element => element && element.link !== undefined))
                        .reduce((left, right) => left.concat(right))
                        .map(links => links.link.split('|').map(elem => dnwfile + '/api/user/download/' + user.token + '/' + product.id_undercmd + '/' + elem));                                                                            
        })
        .map(master => master.reduce((left, right) => left.concat(right)));
    // logger.debug({message: 'result: '+ JSON.stringify(result), className: 'Order Service'}); 
    return result;
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