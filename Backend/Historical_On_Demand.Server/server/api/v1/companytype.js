const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Companytypes = mongoose.model('Companytype');

router.get('/', async (req, res) => {
    let companyTypes = await Companytypes.find().exec();
    if (!companyTypes) return res.sendStatus(404); 
    return res.status(200).json({ companytypes: companyTypes });
});

module.exports = router;