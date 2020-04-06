const router = require('express').Router();
const salesService = require('../service/saleService')

router.get('/', (req, res) => { 
    return res.status(404);
    salesService.GetAllSales().then(result => {
        return res.status(200).json(result);
    });
});

module.exports = router;