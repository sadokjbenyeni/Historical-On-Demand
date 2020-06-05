const router = require('express').Router();
const OrderService = require('../../service/orderService')
const mongoose = require('mongoose');
const Users = mongoose.model('User');
const Orders = mongoose.model('Order');

router.get('/links/:orderId', async (req, res) => {
    var user = await Users.findOne({ token: req.headers.authorization }, { _id: true, roleName: true, token:true }).exec();
    if (!user) {
        req.logger.warn({ message: 'Access is denied, no token provided', className: 'Deliverables API'});
        return res.status(401).json({ error: "No token provided in header, please contact support with '"+ req.headers.loggerToken + "'" })
    }
    if (!req.params.orderId) {
        req.logger.warn({ message: 'Order id is missing', className: 'Deliverables API'});
        return res.status(400).json({ error: "Order id not found, please contact support with '"+ req.headers.loggerToken + "'" })
    }
    var order = await getOrder(req.params.orderId, user);
    if(!order || order === undefined)
    {
        return res.status(400).json({ error: "Order id not found, please contact support with '"+ req.headers.loggerToken + "'" })
    }
    var links = await OrderService.getLinks(user, order, req.logger);
    return res.status(200).json(links)
});

async function getOrder(orderId, user) {    
    if (user.roleName.indexOf('Support') != -1) {
        return await Orders.findOne({ id: orderId }, { id: true, products: true, state: true, createdAt: true, id_undercmd:true }).exec();
    }    
    return await Orders.findOne({ id: req.params.orderId, idUser: user._id }, { id: true, products: true, state: true, createdAt: true, id_undercmd:true }).exec();    
}

module.exports = router

