const app = require('express')();
const router = require('express').Router();

const config = require('../config/config.js');
const HOSTSES = config.hostsES();

const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client({
	hosts: HOSTSES,
    log: 'trace'
});

client.ping({
    requestTimeout: 3000
  }, function (error) {
    if (error) { console.trace('elasticsearch cluster is down!'); }
    else { console.log('All is well'); }
  });

router.post('/', (req, res) => {
	client.search({
        index: req.body.index,
        type: req.body.type,
        _source: req.body.fields,
        body: {
            query: req.body.query,
            aggs: req.body.aggs,
	        size: req.body.size,
	        from: req.body.from,
        }
    }).then(function (resp) {
        res.json(resp);
    }, function (err) {
        console.trace(err.message);
    });
});

module.exports = router;
