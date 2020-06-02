const router = require('express').Router();
const OrderService = require('../../service/orderService')

router.get('/links/:orderId', async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ error: "No token provided in header" })
    }
    if (!req.params.orderId) {
        return res.status(400).json({ error: "No order id provided" })
    }
    var links = await OrderService.getLinks(req.headers.authorization, req.params.orderId);

    return res.status(200).json(links)
});
module.exports = router