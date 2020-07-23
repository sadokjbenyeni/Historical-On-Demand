const app = require('express')();
const router = require('express').Router();
const mongoose = require('mongoose');

const Countries = mongoose.model('Countrie');

const config = require('../config/config.js');
const URLS = config.config();
// const admin = config.admin();

router.get('/', (req, res) => {
    Countries.find()
    .sort({ue: -1, name:1})
    .then((countries) => {
        if (!countries) { return res.sendStatus(404); }
        return res.status(200).json({countries: countries});
    });
});

router.post('/isUE', (req, res) => {
    Countries.findOne({id:req.body.id}, {ue:true, _id: false})
    .then((r) => {
        if (!r) { return res.sendStatus(404); }
        return res.status(200).json(r);
    });
});

router.put('/ue', (req, res) => {
    Countries.updateOne({_id:req.body._id}, { $set: { ue: req.body.ue } })
    .then((r) => {
        if (!r) { return res.sendStatus(404); }
        return res.status(200).json({ message: req.body.name + " has been updated" });
    });
});

router.post('/', (req, res) => {
    let sort = {};
    for (var i = 0; i < req.body.order.length; i++) {
      sort[req.body.columns[req.body.order[i].column].data] = req.body.order[i].dir;
    }
    Countries.count().then((c) => {
        let search = {};
        req.body.columns.forEach(s => {
          if (s.search.value !== '') {
            search[s.data] = new RegExp(s.search.value, "i");
          }
        });
        if (req.body.search.value !== '') {
          search['$or'] = [
            { id: new RegExp(req.body.search.value, "i") },
            { name: new RegExp(req.body.search.value, "i") }
          ];
        }
        Countries.count(search).then((cf) => {
          Countries.find(search)
          .skip(req.body.start)
          .limit(req.body.length)
          .sort(sort)
          .then((countries) => {
            if (!countries) { return res.status(404); }
            return res.status(200).json({recordsFiltered: cf, recordsTotal: c, draw:req.body.draw, countries: countries});
          });
        });
    });
});

module.exports = router;