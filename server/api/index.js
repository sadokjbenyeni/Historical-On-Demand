const router = require('express').Router()


router.use("/v1", require('./v1'));


//v1
//router.use('/v1/order', require('./public/order'));
//router.use('/v1/support/order', require('./support/order'));
module.exports = router;
