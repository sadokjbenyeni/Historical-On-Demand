const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require("crypto");
const PHRASE = global.environment.phrase;

const Role = mongoose.model('Role');

const algorithm = 'aes256';
var identifier = "";

router.param('role', function (req, res, next, id) {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.sendStatus(422);
    }
    identifier = id;
    return next();
});

router.get('/', async (req, res) => {
    let roles = Role.find().exec();
    if (!roles) { return res.sendStatus(404); }
    return res.status(200).json({ roles: roles });
});

router.get('/page', async (req, res) => {
    let pages = Role.distinct('pages').exec();
    if (!pages) { return res.sendStatus(404); }
    return res.status(200).json({ pages: pages });
});

router.get('/:role', async (req, res) => {
    let role = await Role.findById({ _id: Object(req.params.role) }).exec();
    if (!role) res.status(200).json({});
    return res.status(200).json({ role: role });
});

module.exports = router;