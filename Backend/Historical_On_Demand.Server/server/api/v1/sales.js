const router = require('express').Router();
const salesService = require('../../service/saleService')

router.get('/', async (req, res) => {
    let sales = await salesService.GetAllSales();
    return res.status(200).json(sales);
});

module.exports = router;