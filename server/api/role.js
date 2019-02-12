const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');
const crypto = require("crypto");

const Role = mongoose.model('Role');

const config = require('../config/config.js');
const URLS = config.config();
const admin = config.admin();
const PHRASE = config.phrase();
const algorithm = 'aes256';
var idd = "";

router.param('role', function (req, res, next, id) {
   if (!id.match(/^[0-9a-fA-F]{24}$/)) {
       return res.sendStatus(422);
   }
   idd = id;
   return next();
});

router.get('/', (req, res) => {
    Role.find()
    .then((roles) => {
        if (!roles) { return res.sendStatus(404); }
        return res.json({roles: roles})
        .statusCode(200);
    });
});

router.get('/page', (req, res) => {
    Role.distinct('pages')
    .then((pages) => {
        if (!pages) { return res.sendStatus(404); }
        return res.json({pages: pages})
        .statusCode(200);
    });
});

router.get('/:role', (req, res) => {
    // let test = req.headers.referer.replace(idd, "");
    // if(URLS.indexOf(test) !== -1){
        Role.findById({_id: Object(req.params.role)})
        .then((role) => {
            if (!role) { res.json({}).statusCode(200) }
            return res.json({role:role}).statusCode(200);           
        });
    // }
    // else{
    //     return res.sendStatus(404);
    // }
});

module.exports = router;