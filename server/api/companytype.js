const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Companytypes = mongoose.model('Companytype');

const config = require('../config/config.js');
const URLS = config.config();
const admin = config.admin();


router.get('/', (req, res) => {
    Companytypes.find()
    .then((companytypes) => {
        if (!companytypes) { return res.sendStatus(404); }
        return res.json({companytypes: companytypes})
        .statusCode(200);
    });
});

module.exports = router;