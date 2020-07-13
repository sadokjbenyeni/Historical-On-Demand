const router = require('express').Router();
const salesService = require('../../service/saleService')

router.get('/', (req, res) => { 
    salesService.GetAllSales().then(result => {
        return res.status(200).json(result);
    });
});

module.exports = router;