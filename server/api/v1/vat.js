const app = require('express')();
const router = require('express').Router();
const vatService= require('../../service/vatService');
router.get('/:vat', async (req, res) => {
    let vat = req.params.vat.split('|');
    try {
        let data = await vatService.isVatValid(vat[0], vat[1])
        return res.status(200).json({ valid: data });
    }
    catch (error) {
        return res.status(200).json({ valid: false })
    }
});


// router.get('/:vat', (req, res) => {
//     let vat = req.params.vat.split('|');
//     verifyVat(vat[0], vat[1], function (err, result) {
//         if (err) {
//             res.status(200).json({ valid: false });
//         }
//         res.status(200).json(result);
//     });
// });

module.exports = router;