const app = require('express')();
const router = require('express').Router();
const verifyVat = require('validate-vat');

router.get('/:vat', (req, res) => {
    let vat = req.params.vat.split('|');
    verifyVat(vat[0], vat[1], function(err, result) {
        if(err) { res.status(200).json({valid:false}); }
        res.status(200).json(result);
    });
});

module.exports = router;