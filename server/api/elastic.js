/*jshint esversion: 6 */
// const app = require('express')();
const router = require('express').Router();

import { hostsES } from '../config/config.js';
const HOSTSElasticSearch = hostsES();

import { Client } from 'elasticsearch';

const client = new Client({
	hosts: HOSTSElasticSearch,
    log: 'trace'
});


client.ping({
    requestTimeout: 3000
}, function (error) {
    if (error) { console.trace('elasticsearch cluster is down!'); }
    else { console.log('All is well'); }
});

router.post('/', (req, res) => {
    // client.ping({
    //     requestTimeout: 30000
    // }, function (error) {
    //     if (error) { console.trace('elasticsearch cluster is down!'); }
    //     else { console.log('All is well'); }
    // });

    client.search({
        index: req.body.index,
        type: req.body.type,
        _source: req.body.fields,
        body: {
            query: req.body.query,
            args: req.body.args,
            size: req.body.size,
            from: req.body.from,
        }
    }).then(function (resp) {
        res.json(resp);
    }, function (err) {
        console.trace(err.message);
    });
});

export default router;
